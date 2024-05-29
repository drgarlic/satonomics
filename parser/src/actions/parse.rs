use std::{
    collections::{BTreeMap, BTreeSet},
    ops::ControlFlow,
    thread,
};

use bitcoin::Block;
use chrono::NaiveDate;
use itertools::Itertools;
use rayon::prelude::*;

use crate::{
    bitcoin::BitcoinDB,
    databases::{AddressIndexToEmptyAddressData, AddressToAddressIndex, Databases, TxidToTxIndex},
    datasets::{AllDatasets, InsertData},
    states::{
        AddressCohortsInputStates, AddressCohortsOutputStates, AddressCohortsRealizedStates,
        States, UTXOCohortsOneShotStates, UTXOCohortsSentStates,
    },
    structs::{
        Address, AddressData, AddressRealizedData, BlockData, BlockPath, Counter, EmptyAddressData,
        PartialTxoutData, TxData, TxoutIndex,
    },
};

pub struct ParseData<'a> {
    pub bitcoin_db: &'a BitcoinDB,
    pub block: Block,
    pub block_index: usize,
    pub compute_addresses: bool,
    pub databases: &'a mut Databases,
    pub datasets: &'a mut AllDatasets,
    pub date: NaiveDate,
    pub first_date_height: usize,
    pub height: usize,
    pub is_date_last_block: bool,
    pub states: &'a mut States,
    pub timestamp: u32,
}

#[derive(Default, Debug)]
pub struct SentData {
    pub volume: u64,
    pub count: u32,
}

impl SentData {
    pub fn send(&mut self, sats: u64) {
        self.volume += sats;
        self.count += 1;
    }
}

// #[derive(Default, Debug)]
// pub struct ReceivedData {
//     pub volume: u64,
//     pub count: u32,
// }

// impl ReceivedData {
//     pub fn receive(&mut self, sats: u64) {
//         self.volume += sats;
//         self.count += 1;
//     }
// }

pub fn parse(
    ParseData {
        bitcoin_db,
        block,
        block_index,
        compute_addresses,
        databases,
        datasets,
        date,
        first_date_height,
        height,
        is_date_last_block,
        states,
        timestamp,
    }: ParseData,
) {
    // If false, expect that the code is flawless
    // or create a 0 value txid database
    let enable_check_if_txout_value_is_zero_in_db: bool = true;

    let date_index = states.date_data_vec.len() - 1;

    // let block_path = BlockPath {
    //     date_index: date_index as u16,
    //     block_index: block_index as u16,
    // };

    let previous_timestamp = if height > 0 {
        Some(
            datasets
                .block_metadata
                .timestamp
                .get(&(height - 1))
                .unwrap(),
        )
    } else {
        None
    };

    let block_price = datasets
        .price
        .height
        .get(height, timestamp, previous_timestamp)
        .unwrap_or_else(|_| panic!("Expect {height} to have a price"))
        .close;

    let date_price = datasets
        .price
        .date
        .get(date)
        .unwrap_or_else(|_| panic!("Expect {date} to have a price"))
        .close;

    let difficulty = block.header.difficulty_float();
    let block_size = block.total_size();
    let block_weight = block.weight().to_wu();
    let block_vbytes = block.weight().to_vbytes_floor();
    let block_interval =
        previous_timestamp.map_or(0, |previous_timestamp| timestamp - previous_timestamp);

    states
        .date_data_vec
        .last_mut()
        .unwrap()
        .blocks
        .push(BlockData::new(height as u32, block_price, timestamp));

    let mut block_path_to_sent_data: BTreeMap<BlockPath, SentData> = BTreeMap::default();
    // let mut received_data: ReceivedData = ReceivedData::default();
    let mut address_index_to_address_realized_data: BTreeMap<u32, AddressRealizedData> =
        BTreeMap::default();
    let mut address_index_to_removed_address_data: BTreeMap<u32, AddressData> = BTreeMap::default();

    let mut address_index_removed_at_least_once: BTreeSet<u32> = BTreeSet::default();

    let mut coinbase = 0;
    let mut satblocks_destroyed = 0;
    let mut satdays_destroyed = 0;
    let mut sats_sent = 0;
    let mut transaction_count = 0;
    let mut fees = vec![];
    let mut fees_total = 0;

    let (
        (
            TxoutsParsingResults {
                op_returns: _op_returns,
                mut partial_txout_data_vec,
                provably_unspendable: _provably_unspendable,
            },
            mut empty_address_index_to_empty_address_data,
        ),
        mut txin_ordered_tx_indexes,
    ) = thread::scope(|scope| {
        let output_handle = scope.spawn(|| {
            let mut txouts_parsing_results = parse_txouts(
                &block,
                compute_addresses,
                &mut states.address_counters.op_return_addresses,
                &mut states.address_counters.push_only_addresses,
                &mut states.address_counters.unknown_addresses,
                &mut states.address_counters.empty_addresses,
                &mut databases.address_to_address_index,
            );

            let empty_address_index_to_empty_address_data = compute_addresses.then(|| {
                take_empty_address_index_to_empty_address_data(
                    states,
                    &mut databases.address_index_to_empty_address_data,
                    &txouts_parsing_results.partial_txout_data_vec,
                    compute_addresses,
                )
            });

            // Reverse to get in order via pop later
            txouts_parsing_results.partial_txout_data_vec.reverse();

            (
                txouts_parsing_results,
                empty_address_index_to_empty_address_data,
            )
        });

        let input_handle = scope.spawn(|| {
            let mut txin_ordered_tx_indexes =
                query_txin_ordered_tx_indexes(&block, &mut databases.txid_to_tx_index);

            // Reverse to get in order via pop later
            txin_ordered_tx_indexes.reverse();

            txin_ordered_tx_indexes
        });

        (output_handle.join().unwrap(), input_handle.join().unwrap())
    });

    block
        .txdata
        .into_iter()
        .enumerate()
        .try_for_each(|(block_tx_index, tx)| {
            let txid = tx.txid();
            let tx_index = databases.txid_to_tx_index.metadata.serial as u32;

            transaction_count += 1;

            // --
            // outputs
            // ---

            let mut utxos = BTreeMap::new();
            let mut spendable_sats = 0;

            let is_coinbase = tx.is_coinbase();

            if is_coinbase != (block_tx_index == 0) {
                unreachable!();
            }

            let mut inputs_sum = 0;
            let mut outputs_sum = 0;

            // Before `input` to cover outputs being used in the same block as inputs
            tx.output
                .into_iter()
                .enumerate()
                .filter_map(|(vout, tx_out)| {
                    if vout > (u16::MAX as usize) {
                        panic!("vout can indeed be bigger than u16::MAX !");
                    }

                    let sats = tx_out.value.to_sat();

                    if is_coinbase {
                        coinbase += sats;
                    } else {
                        outputs_sum += sats;
                    }

                    partial_txout_data_vec
                        .pop()
                        .unwrap()
                        // None if not worth parsing (empty/op_return/...)
                        .map(|partial_txout_data| (vout, partial_txout_data))
                })
                .for_each(|(vout, partial_txout_data)| {
                    let vout = vout as u16;

                    let txout_index = TxoutIndex::new(tx_index, vout);

                    let PartialTxoutData {
                        address,
                        address_index_opt,
                        sats,
                    } = partial_txout_data;

                    spendable_sats += sats;

                    utxos.insert(vout, sats);

                    states.txout_index_to_sats.insert(txout_index, sats);

                    if compute_addresses {
                        let address = address.unwrap();

                        let (address_data, address_index) = {
                            if let Some(address_index) = address_index_opt.or_else(|| {
                                databases
                                    .address_to_address_index
                                    .unsafe_get_from_puts(&address)
                                    .cloned()
                            }) {
                                if let Some(address_data) =
                                    states.address_index_to_address_data.get_mut(&address_index)
                                {
                                    // TODO: Remove after a while
                                    if address_data.is_empty() {
                                        panic!("address_data shouldn't be empty");
                                    }

                                    (address_data, address_index)
                                } else {
                                    let empty_address_data =
                                        empty_address_index_to_empty_address_data
                                            .as_mut()
                                            .unwrap()
                                            .remove(&address_index)
                                            .or_else(|| {
                                                address_index_to_removed_address_data
                                                    .remove(&address_index);

                                                databases
                                                    .address_index_to_empty_address_data
                                                    .undo_insert(&address_index)
                                            })
                                            .unwrap_or_else(|| {
                                                dbg!(address_index);
                                                panic!("Should've been there");
                                            });

                                    let contains_key = states
                                        .address_index_to_address_data
                                        .contains_key(&address_index);

                                    if contains_key {
                                        panic!("Shouldn't be anything there");
                                    }

                                    let address_data = states
                                        .address_index_to_address_data
                                        .entry(address_index)
                                        // Will always insert, it's to avoid insert + get
                                        .or_insert(AddressData::from_empty(&empty_address_data));

                                    (address_data, address_index)
                                }
                            } else {
                                let address_index =
                                    databases.address_to_address_index.metadata.serial as u32;

                                let address_type = address.to_type();

                                if let Some(previous) = databases
                                    .address_to_address_index
                                    .insert(address, address_index)
                                {
                                    dbg!(previous);
                                    panic!(
                                        "address #{address_index} shouldn't be present during put"
                                    );
                                }

                                let address_data = states
                                    .address_index_to_address_data
                                    .entry(address_index)
                                    // Will always insert, it's to avoid insert + get
                                    .or_insert(AddressData::new(address_type));

                                (address_data, address_index)
                            }
                        };

                        // MUST be before received !
                        let address_realized_data = address_index_to_address_realized_data
                            .entry(address_index)
                            .or_insert_with(|| AddressRealizedData::default(address_data));

                        address_data.receive(sats, block_price);

                        address_realized_data.receive(sats);

                        states
                            .txout_index_to_address_index
                            .insert(txout_index, address_index);
                    }
                });

            let last_block = states.date_data_vec.last_mut_block().unwrap();

            last_block.amount += spendable_sats;

            if !utxos.is_empty() {
                last_block.spendable_outputs += utxos.len() as u32;

                databases.txid_to_tx_index.insert(&txid, tx_index);

                states.tx_index_to_tx_data.insert(
                    tx_index,
                    TxData::new(
                        BlockPath::new(date_index as u16, block_index as u16),
                        utxos.len() as u16,
                    ),
                );
            }

            // ---
            // inputs
            // ---

            if !is_coinbase {
                tx.input.into_iter().try_for_each(|txin| {
                    let outpoint = txin.previous_output;
                    let input_txid = outpoint.txid;
                    let input_vout = outpoint.vout;

                    let input_tx_index = {
                        let input_tx_index = txin_ordered_tx_indexes.pop().unwrap().or_else(|| {
                            databases
                                .txid_to_tx_index
                                .unsafe_get_from_puts(&input_txid)
                                .cloned()
                        });

                        if input_tx_index.is_none() {
                            if !enable_check_if_txout_value_is_zero_in_db
                                || bitcoin_db
                                    .check_if_txout_value_is_zero(&input_txid, input_vout as usize)
                            {
                                return ControlFlow::Continue::<()>(());
                            }

                            dbg!((input_txid, txid, tx_index, input_vout));
                            panic!("Txid to be in txid_to_tx_data");
                        }

                        let input_tx_index = input_tx_index.unwrap();

                        let input_vout = input_vout as u16;

                        let input_txout_index = TxoutIndex::new(input_tx_index, input_vout);

                        let input_tx_data = states.tx_index_to_tx_data.get_mut(&input_tx_index);

                        if input_tx_data.is_none() {
                            if !enable_check_if_txout_value_is_zero_in_db
                                || bitcoin_db
                                    .check_if_txout_value_is_zero(&input_txid, input_vout as usize)
                            {
                                return ControlFlow::Continue::<()>(());
                            }

                            dbg!((
                                input_txid,
                                tx_index,
                                input_tx_index,
                                input_vout,
                                input_tx_data,
                            ));
                            panic!("Txout index to be in txout_index_to_txout_value");
                        }

                        let input_tx_data = input_tx_data.unwrap();

                        let input_sats = states.txout_index_to_sats.remove(&input_txout_index);

                        if input_sats.is_none() {
                            if !enable_check_if_txout_value_is_zero_in_db
                                || bitcoin_db
                                    .check_if_txout_value_is_zero(&input_txid, input_vout as usize)
                            {
                                return ControlFlow::Continue::<()>(());
                            }

                            dbg!((
                                input_txid,
                                tx_index,
                                input_tx_index,
                                input_vout,
                                input_tx_data,
                            ));
                            panic!("Txout index to be in txout_index_to_txout_value");
                        }

                        let input_sats = input_sats.unwrap();

                        let input_block_path = input_tx_data.block_path;

                        let input_tx_data =
                            states.tx_index_to_tx_data.get_mut(&input_tx_index).unwrap();

                        input_tx_data.utxos -= 1;

                        let BlockPath {
                            date_index: input_date_index,
                            block_index: input_block_index,
                        } = input_block_path;

                        let input_date_data = states
                            .date_data_vec
                            .get_mut(input_date_index as usize)
                            .unwrap_or_else(|| {
                                dbg!(height, &input_txid, input_block_path, input_date_index);
                                panic!()
                            });

                        let input_block_data = input_date_data
                            .blocks
                            .get_mut(input_block_index as usize)
                            .unwrap_or_else(|| {
                                dbg!(
                                    height,
                                    &input_txid,
                                    input_block_path,
                                    input_date_index,
                                    input_block_index,
                                );
                                panic!()
                            });

                        input_block_data.spendable_outputs -= 1;

                        input_block_data.amount -= input_sats;

                        inputs_sum += input_sats;

                        block_path_to_sent_data
                            .entry(input_block_path)
                            .or_default()
                            .send(input_sats);

                        satblocks_destroyed +=
                            (height as u64 - input_block_data.height as u64) * input_sats;

                        satdays_destroyed +=
                            date.signed_duration_since(*input_date_data.date).num_days() as u64
                                * input_sats;

                        if compute_addresses {
                            let input_address_index = states
                                .txout_index_to_address_index
                                .remove(&input_txout_index)
                                .unwrap();

                            let input_address_is_empty = {
                                let input_address_data = states
                                    .address_index_to_address_data
                                    .get_mut(&input_address_index)
                                    .unwrap_or_else(|| {
                                        dbg!(input_address_index);
                                        panic!();
                                    });

                                let input_address_realized_data =
                                    address_index_to_address_realized_data
                                        .entry(input_address_index)
                                        .or_insert_with(|| {
                                            AddressRealizedData::default(input_address_data)
                                        });

                                // MUST be after `or_insert_with`
                                let address_realized_profit_or_loss =
                                    input_address_data.send(input_sats, input_block_data.price);

                                input_address_realized_data
                                    .send(input_sats, address_realized_profit_or_loss);

                                input_address_data.is_empty()
                            };

                            if input_address_is_empty {
                                let input_address_data = states
                                    .address_index_to_address_data
                                    .remove(&input_address_index)
                                    .unwrap();

                                address_index_removed_at_least_once.insert(input_address_index);

                                databases.address_index_to_empty_address_data.insert(
                                    input_address_index,
                                    EmptyAddressData::from_non_empty(&input_address_data),
                                );

                                address_index_to_removed_address_data
                                    .insert(input_address_index, input_address_data);
                            }
                        }

                        if input_tx_data.is_empty() {
                            Some(input_tx_index)
                        } else {
                            None
                        }
                    };

                    if let Some(input_tx_index) = input_tx_index {
                        states.tx_index_to_tx_data.remove(&input_tx_index);
                        databases.txid_to_tx_index.remove(&input_txid);
                    }

                    ControlFlow::Continue(())
                })?;
            }

            sats_sent += inputs_sum;

            let fee = inputs_sum - outputs_sum;

            fees_total += fee;
            fees.push(fee);

            ControlFlow::Continue(())
        });

    if !partial_txout_data_vec.is_empty() {
        panic!("partial_txout_data_vec should've been fully consumed");
    }

    if !txin_ordered_tx_indexes.is_empty() {
        panic!("txin_ordered_tx_indexes should've been fully consumed");
    }

    let mut utxo_cohorts_sent_states = UTXOCohortsSentStates::default();
    let mut utxo_cohorts_one_shot_states = UTXOCohortsOneShotStates::default();
    // let mut utxo_cohorts_received_states = UTXOCohortsReceivedStates::default();

    let mut address_cohorts_input_states = None;
    let mut address_cohorts_one_shot_states = None;
    let mut address_cohorts_output_states = None;
    let mut address_cohorts_realized_states = None;

    thread::scope(|scope| {
        scope.spawn(|| {
            let last_block_data = states.date_data_vec.last_block().unwrap();

            let previous_last_block_data = states.date_data_vec.second_last_block();

            if let Some(previous_last_block_data) = previous_last_block_data {
                block_path_to_sent_data
                    .iter()
                    .for_each(|(block_path, sent_data)| {
                        let block_data = states.date_data_vec.get(block_path).unwrap();

                        if block_data.height != last_block_data.height {
                            states.utxo_cohorts_durable_states.subtract_moved(
                                block_data,
                                sent_data,
                                previous_last_block_data,
                            );
                        }
                    });
            }

            states
                .date_data_vec
                .iter()
                .flat_map(|date_data| &date_data.blocks)
                .for_each(|block_data| {
                    states.utxo_cohorts_durable_states.udpate_age_if_needed(
                        block_data,
                        last_block_data,
                        previous_last_block_data,
                    );
                });

            utxo_cohorts_one_shot_states =
                states.utxo_cohorts_durable_states.compute_one_shot_states(
                    block_price,
                    if is_date_last_block {
                        Some(date_price)
                    } else {
                        None
                    },
                );
        });

        // scope.spawn(|| {
        //     utxo_cohorts_received_states
        //         .compute(&states.date_data_vec, block_path_to_received_data);
        // });

        scope.spawn(|| {
            utxo_cohorts_sent_states.compute(
                &states.date_data_vec,
                &block_path_to_sent_data,
                block_price,
            );
        });

        if compute_addresses {
            scope.spawn(|| {
                address_cohorts_realized_states.replace(AddressCohortsRealizedStates::default());
                address_cohorts_input_states.replace(AddressCohortsInputStates::default());
                address_cohorts_output_states.replace(AddressCohortsOutputStates::default());

                address_index_to_address_realized_data.iter().for_each(
                    |(address_index, address_realized_data)| {
                        // dbg!(address_realized_data);

                        let current_address_data = states
                            .address_index_to_address_data
                            .get(address_index)
                            .unwrap_or_else(|| {
                                address_index_to_removed_address_data
                                    .get(address_index)
                                    .unwrap()
                            });

                        states
                            .address_cohorts_durable_states
                            .iterate(address_realized_data, current_address_data);

                        if !address_realized_data.initial_address_data.is_new() {
                            // Realized == previous amount
                            // If a whale sent all its sats to another address at a loss, it's the whale that realized the loss not the now empty adress
                            let liquidity_classification = address_realized_data
                                .initial_address_data
                                .compute_liquidity_classification();

                            address_cohorts_realized_states
                                .as_mut()
                                .unwrap()
                                .iterate_realized(address_realized_data, &liquidity_classification);

                            address_cohorts_input_states
                                .as_mut()
                                .unwrap()
                                .iterate_input(address_realized_data, &liquidity_classification);
                        }

                        address_cohorts_output_states
                            .as_mut()
                            .unwrap()
                            .iterate_output(
                                address_realized_data,
                                &current_address_data.compute_liquidity_classification(),
                            );
                    },
                );

                address_cohorts_one_shot_states.replace(
                    states
                        .address_cohorts_durable_states
                        .compute_one_shot_states(
                            block_price,
                            if is_date_last_block {
                                Some(date_price)
                            } else {
                                None
                            },
                        ),
                );
            });
        }
    });

    datasets.insert(InsertData {
        address_cohorts_input_states: &address_cohorts_input_states,
        block_size,
        block_vbytes,
        block_weight,
        address_cohorts_one_shot_states: &address_cohorts_one_shot_states,
        address_cohorts_output_states: &address_cohorts_output_states,
        address_cohorts_realized_states: &address_cohorts_realized_states,
        address_index_to_address_realized_data: &address_index_to_address_realized_data,
        address_index_to_removed_address_data: &address_index_to_removed_address_data,
        block_interval,
        block_price,
        coinbase,
        compute_addresses,
        databases,
        date,
        date_blocks_range: &(first_date_height..=height),
        date_first_height: first_date_height,
        date_price,
        difficulty,
        fees: &fees,
        height,
        is_date_last_block,
        satblocks_destroyed,
        satdays_destroyed,
        sats_sent,
        states,
        timestamp,
        transaction_count,
        utxo_cohorts_one_shot_states: &utxo_cohorts_one_shot_states,
        // utxo_cohorts_received_states: &utxo_cohorts_received_states,
        utxo_cohorts_sent_states: &utxo_cohorts_sent_states,
    });
}

pub struct TxoutsParsingResults {
    partial_txout_data_vec: Vec<Option<PartialTxoutData>>,
    provably_unspendable: u64,
    op_returns: usize,
}

fn parse_txouts(
    block: &Block,
    compute_addresses: bool,
    op_return_addresses: &mut Counter,
    push_only_addresses: &mut Counter,
    unknown_addresses: &mut Counter,
    empty_addresses: &mut Counter,
    address_to_address_index: &mut AddressToAddressIndex,
) -> TxoutsParsingResults {
    let mut provably_unspendable = 0;
    let mut op_returns = 0;

    let mut partial_txout_data_vec = block
        .txdata
        .iter()
        .flat_map(|tx| {
            // dbg!(tx.txid());

            &tx.output
        })
        // .enumerate()
        .map(|txout| {
            // dbg!(txout_index);

            let script = &txout.script_pubkey;
            let value = txout.value.to_sat();

            // 0 sats outputs are possible and allowed !
            // https://mempool.space/tx/2f2442f68e38b980a6c4cec21e71851b0d8a5847d85208331a27321a9967bbd6
            // https://bitcoin.stackexchange.com/questions/104937/transaction-outputs-with-value-0
            if value == 0 {
                return None;
            }

            // https://mempool.space/tx/fd0d23d88059dd3b285ede0c88a1246b880e9d8cbac8aa0077a37d70091769d1#flow=&vout=2
            if script.is_op_return() {
                // TODO: Count fee paid to write said OP_RETURN, beware of coinbase transactions
                // For coinbase transactions, count miners
                op_returns += 1;
                provably_unspendable += value;

                // return None;
            }
            // https://mempool.space/tx/8a68c461a2473653fe0add786f0ca6ebb99b257286166dfb00707be24716af3a#flow=&vout=0
            else if script.is_provably_unspendable() {
                provably_unspendable += value;
                // return None;
            }

            let address_opt = compute_addresses.then(|| {
                let address = Address::from(
                    txout,
                    op_return_addresses,
                    push_only_addresses,
                    unknown_addresses,
                    empty_addresses,
                );

                address_to_address_index.open_db(&address);

                address
            });

            Some(PartialTxoutData::new(address_opt, value, None))
        })
        .collect_vec();

    if compute_addresses {
        partial_txout_data_vec
            .par_iter_mut()
            .for_each(|partial_tx_out_data| {
                if let Some(partial_tx_out_data) = partial_tx_out_data {
                    partial_tx_out_data.address_index_opt = address_to_address_index
                        .unsafe_get(partial_tx_out_data.address.as_ref().unwrap())
                        .cloned();
                }
            });
    }

    TxoutsParsingResults {
        partial_txout_data_vec,
        provably_unspendable,
        op_returns,
    }
}

fn take_empty_address_index_to_empty_address_data(
    states: &mut States,
    address_index_to_empty_address_data: &mut AddressIndexToEmptyAddressData,
    partial_txout_data_vec: &[Option<PartialTxoutData>],
    compute_addresses: bool,
) -> BTreeMap<u32, EmptyAddressData> {
    if !compute_addresses {
        return BTreeMap::default();
    }

    let address_index_to_address_data = &mut states.address_index_to_address_data;

    let mut empty_address_index_to_empty_address_data = partial_txout_data_vec
        .iter()
        .flatten()
        .flat_map(|partial_txout_data| partial_txout_data.address_index_opt)
        .flat_map(|address_index| {
            if address_index_to_address_data.contains_key(&address_index) {
                None
            } else {
                address_index_to_empty_address_data.open_db(&address_index);

                Some((address_index, EmptyAddressData::default()))
            }
        })
        .collect::<BTreeMap<_, _>>();

    empty_address_index_to_empty_address_data
        .par_iter_mut()
        .for_each(|(address_index, empty_address_data)| {
            empty_address_data.copy(
                address_index_to_empty_address_data
                    .unsafe_get(address_index)
                    .unwrap(),
            );
        });

    // Parallel unsafe_get + Linear remove = Parallel-ish take
    empty_address_index_to_empty_address_data
        .keys()
        .for_each(|address_index| {
            address_index_to_empty_address_data.remove(address_index);
        });

    empty_address_index_to_empty_address_data
}

fn query_txin_ordered_tx_indexes(
    block: &Block,
    txid_to_tx_index: &mut TxidToTxIndex,
) -> Vec<Option<u32>> {
    block
        .txdata
        .iter()
        .skip(1) // Skip coinbase transaction
        .flat_map(|tx| &tx.input)
        .for_each(|txin| {
            txid_to_tx_index.open_db(&txin.previous_output.txid);
        });

    block
        .txdata
        .par_iter()
        .skip(1) // Skip coinbase transaction
        .flat_map(|tx| &tx.input)
        .map(|txin| {
            txid_to_tx_index
                .unsafe_get(&txin.previous_output.txid)
                .cloned()
        })
        .collect::<Vec<_>>()
}
