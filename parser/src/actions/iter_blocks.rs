use std::{collections::BTreeSet, time::Instant};

use chrono::{offset::Local, Datelike};
use export::ExportedData;
use itertools::Itertools;

use parse::ParseData;

use crate::{
    actions::{export, find_first_inserted_unsafe_height, parse},
    bitcoin::{check_if_height_safe, BitcoinDB, NUMBER_OF_UNSAFE_BLOCKS},
    databases::Databases,
    datasets::{AllDatasets, ComputeData},
    states::States,
    structs::DateData,
    utils::timestamp_to_naive_date,
};

pub fn iter_blocks(bitcoin_db: &BitcoinDB, block_count: usize) -> color_eyre::Result<()> {
    let should_insert = true;
    let should_export = true;

    println!("{:?} - Starting...", Local::now());

    let mut datasets = AllDatasets::import()?;
    // RAM: 200MB at this point

    println!("{:?} - Imported datasets", Local::now());

    let mut databases = Databases::import();
    // RAM: 200MB too

    println!("{:?} - Imported databases", Local::now());

    let mut states = States::import().unwrap_or_default();
    // ROM: 8GB of bin files
    // RAM: 17.62GB with everything
    // ---
    // Addresses and Utxos states: 10MB
    // address_index_to_address_data: 4.35GB RAM vs 2GB ROM
    // txout_index_to_address_index: 4.45GB RAM vs 1.81GB ROM
    // txout_index_to_sats: 5.89GB RAM vs 2.53GB ROM
    // tx_index_to_tx_data: 2.73GB RAM vs 1.24GB ROM

    println!("{:?} - Imported states", Local::now());

    let first_unsafe_heights =
        find_first_inserted_unsafe_height(&mut states, &mut databases, &datasets);

    let mut height = first_unsafe_heights.min();

    println!("{:?} - Starting parsing at height: {height}", Local::now());

    let mut block_iter = bitcoin_db.iter_block(height, block_count);

    let mut next_block_opt = None;
    let mut blocks_loop_date = None;

    'parsing: loop {
        let time = Instant::now();

        let mut processed_heights = BTreeSet::new();
        let mut processed_dates = BTreeSet::new();

        'days: loop {
            let mut blocks_loop_i = 0;

            if next_block_opt.is_some() {
                blocks_loop_date.take();
            }

            'blocks: loop {
                let current_block_opt = next_block_opt.take().or_else(|| block_iter.next());

                next_block_opt = block_iter.next();

                if let Some(current_block) = current_block_opt {
                    let timestamp = current_block.header.time;

                    let current_block_date = timestamp_to_naive_date(timestamp);
                    let current_block_height = height + blocks_loop_i;

                    let next_block_date = next_block_opt
                        .as_ref()
                        .map(|next_block| timestamp_to_naive_date(next_block.header.time));

                    // Always run for the first block of the loop
                    if blocks_loop_date.is_none() {
                        blocks_loop_date.replace(current_block_date);

                        if states
                            .date_data_vec
                            .last()
                            .map(|date_data| *date_data.date < current_block_date)
                            .unwrap_or(true)
                        {
                            states
                                .date_data_vec
                                .push(DateData::new(current_block_date, vec![]));
                        }

                        println!(
                            "{:?} - Processing {current_block_date} (height: {height})...",
                            Local::now()
                        );
                    }

                    let blocks_loop_date = blocks_loop_date.unwrap();

                    if current_block_date > blocks_loop_date {
                        panic!("current block should always have the same date as the current blocks loop");
                    }

                    let is_date_last_block = next_block_date
                        // Do NOT change `blocks_loop_date` to `current_block_date` !!!
                        .map_or(true, |next_block_date| blocks_loop_date < next_block_date);

                    processed_heights.insert(current_block_height);

                    if should_insert && first_unsafe_heights.inserted <= current_block_height {
                        let compute_addresses = databases.check_if_needs_to_compute_addresses(
                            current_block_height,
                            blocks_loop_date,
                        );

                        parse(ParseData {
                            bitcoin_db,
                            block: current_block,
                            block_index: blocks_loop_i,
                            compute_addresses,
                            databases: &mut databases,
                            datasets: &mut datasets,
                            date: blocks_loop_date,
                            first_date_height: height,
                            height: current_block_height,
                            is_date_last_block,
                            states: &mut states,
                            timestamp,
                        });
                    }

                    blocks_loop_i += 1;

                    if is_date_last_block {
                        processed_dates.insert(blocks_loop_date);

                        // dbg!(
                        //     current_block_date,
                        //     height,
                        //     current_block_height,
                        //     is_date_last_block
                        // );

                        height += blocks_loop_i;

                        let is_new_month = next_block_date
                            .map_or(true, |next_block_date| next_block_date.day() == 1);

                        let is_close_to_the_end =
                            height > (block_count - (NUMBER_OF_UNSAFE_BLOCKS * 3));

                        if is_new_month || is_close_to_the_end {
                            break 'days;
                        }

                        break 'blocks;
                    }
                } else {
                    break 'parsing;
                }
            }
        }

        // Don't remember why -1
        let last_height = height - 1;

        println!(
            "Parsing month took {} seconds (last height: {last_height})\n",
            time.elapsed().as_secs_f32(),
        );

        if first_unsafe_heights.computed <= last_height {
            datasets.compute(ComputeData {
                dates: &processed_dates.into_iter().collect_vec(),
                heights: &processed_heights.into_iter().collect_vec(),
            });
        }

        if should_export {
            let is_safe = check_if_height_safe(height, block_count);

            export(ExportedData {
                databases: is_safe.then_some(&mut databases),
                datasets: &mut datasets,
                date: blocks_loop_date.unwrap(),
                height: last_height,
                states: is_safe.then_some(&states),
            })?;
        }
    }

    Ok(())
}
