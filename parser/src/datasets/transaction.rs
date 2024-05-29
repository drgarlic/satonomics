use crate::{
    bitcoin::sats_to_btc,
    datasets::InsertData,
    structs::{AnyBiMap, BiMap},
    utils::{ONE_DAY_IN_S, ONE_YEAR_IN_DAYS},
    HeightMap,
};

use super::{AnyDataset, ComputeData, MinInitialStates};

pub struct TransactionDataset {
    min_initial_states: MinInitialStates,

    // Inserted
    pub count: BiMap<usize>,
    pub volume: BiMap<f64>,
    pub volume_in_dollars: BiMap<f32>,
    // Average sent
    // Average sent in dollars
    // Median sent
    // Median sent in dollars
    // Min
    // Max
    // 10th 25th 75th 90th percentiles

    // Computed
    pub annualized_volume: BiMap<f32>,
    pub annualized_volume_in_dollars: BiMap<f32>,
    pub velocity: BiMap<f32>,
    pub transactions_per_second: BiMap<f32>,
}

impl TransactionDataset {
    pub fn import(parent_path: &str) -> color_eyre::Result<Self> {
        let f = |s: &str| format!("{parent_path}/{s}");

        let mut s = Self {
            min_initial_states: MinInitialStates::default(),

            count: BiMap::new_bin(1, &f("transaction_count")),
            volume: BiMap::new_bin(1, &f("transaction_volume")),
            volume_in_dollars: BiMap::new_bin(1, &f("transaction_volume_in_dollars")),
            annualized_volume: BiMap::new_bin(1, &f("annualized_transaction_volume")),
            annualized_volume_in_dollars: BiMap::new_bin(
                1,
                &f("annualized_transaction_volume_in_dollars"),
            ),
            velocity: BiMap::new_bin(1, &f("transaction_velocity")),
            transactions_per_second: BiMap::new_bin(1, &f("transactions_per_second")),
        };

        s.min_initial_states
            .consume(MinInitialStates::compute_from_dataset(&s));

        Ok(s)
    }

    pub fn insert(
        &mut self,
        &InsertData {
            height,
            date,
            sats_sent,
            transaction_count,
            is_date_last_block,
            date_blocks_range,
            block_price,
            ..
        }: &InsertData,
    ) {
        self.count.height.insert(height, transaction_count);

        let volume = self.volume.height.insert(height, sats_to_btc(sats_sent));

        self.volume_in_dollars
            .height
            .insert(height, volume as f32 * block_price);

        if is_date_last_block {
            self.count.date_insert_sum_range(date, date_blocks_range);

            self.volume.date_insert_sum_range(date, date_blocks_range);

            self.volume_in_dollars
                .date_insert_sum_range(date, date_blocks_range);
        }
    }

    pub fn compute(
        &mut self,
        &ComputeData { heights, dates }: &ComputeData,
        circulating_supply: &mut BiMap<f64>,
        block_interval: &mut HeightMap<u32>,
    ) {
        self.annualized_volume.multi_insert_last_x_sum(
            heights,
            dates,
            &mut self.volume,
            ONE_YEAR_IN_DAYS,
        );

        self.annualized_volume_in_dollars.multi_insert_last_x_sum(
            heights,
            dates,
            &mut self.volume,
            ONE_YEAR_IN_DAYS,
        );

        self.velocity.multi_insert_divide(
            heights,
            dates,
            &mut self.annualized_volume,
            circulating_supply,
        );

        heights.iter().for_each(|height| {
            self.transactions_per_second.height.insert(
                *height,
                self.count.height.get_or_import(height) as f32
                    / (block_interval.get_or_import(height)) as f32,
            );
        });

        self.transactions_per_second
            .date
            .multi_insert_simple_transform(dates, &mut self.count.date, |count| {
                count as f32 / ONE_DAY_IN_S as f32
            });
    }
}

impl AnyDataset for TransactionDataset {
    fn get_min_initial_states(&self) -> &MinInitialStates {
        &self.min_initial_states
    }

    fn to_inserted_bi_map_vec(&self) -> Vec<&(dyn AnyBiMap + Send + Sync)> {
        vec![&self.count, &self.volume, &self.volume_in_dollars]
    }

    fn to_inserted_mut_bi_map_vec(&mut self) -> Vec<&mut dyn AnyBiMap> {
        vec![
            &mut self.count,
            &mut self.volume,
            &mut self.volume_in_dollars,
        ]
    }

    fn to_computed_bi_map_vec(&self) -> Vec<&(dyn AnyBiMap + Send + Sync)> {
        vec![
            &self.annualized_volume,
            &self.annualized_volume_in_dollars,
            &self.velocity,
            &self.transactions_per_second,
        ]
    }

    fn to_computed_mut_bi_map_vec(&mut self) -> Vec<&mut dyn AnyBiMap> {
        vec![
            &mut self.annualized_volume,
            &mut self.annualized_volume_in_dollars,
            &mut self.velocity,
            &mut self.transactions_per_second,
        ]
    }
}
