use crate::{
    bitcoin::sats_to_btc,
    datasets::InsertData,
    structs::{AnyBiMap, BiMap},
    utils::ONE_YEAR_IN_DAYS,
};

use super::{AnyDataset, ComputeData, MinInitialStates};

pub struct TransactionDataset {
    min_initial_states: MinInitialStates,

    // Inserted
    pub count: BiMap<usize>,
    pub volume: BiMap<f32>,

    // Computed
    pub annualized_volume: BiMap<f32>,
    pub velocity: BiMap<f32>,
    // add transactions_per_second
}

impl TransactionDataset {
    pub fn import(parent_path: &str) -> color_eyre::Result<Self> {
        let f = |s: &str| format!("{parent_path}/{s}");

        let mut s = Self {
            min_initial_states: MinInitialStates::default(),

            count: BiMap::new_bin(1, &f("transaction_count")),
            volume: BiMap::_new_bin(1, &f("transaction_volume"), 5),

            annualized_volume: BiMap::_new_bin(1, &f("annualized_transaction_volume"), usize::MAX),
            velocity: BiMap::new_bin(1, &f("transaction_velocity")),
        };

        s.min_initial_states
            .consume(MinInitialStates::compute_from_dataset(&s));

        dbg!(&s.min_initial_states);

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
            ..
        }: &InsertData,
    ) {
        self.count.height.insert(height, transaction_count);

        self.volume.height.insert(height, sats_to_btc(sats_sent));

        if is_date_last_block {
            self.count.date_insert_sum_range(date, date_blocks_range);

            self.volume.date_insert_sum_range(date, date_blocks_range);
        }
    }

    pub fn compute(
        &mut self,
        &ComputeData { heights, dates }: &ComputeData,
        circulating_supply: &mut BiMap<f32>,
    ) {
        self.annualized_volume.multiple_insert_last_x_sum(
            heights,
            dates,
            &mut self.volume,
            ONE_YEAR_IN_DAYS,
        );

        self.velocity.multiple_insert_divide(
            heights,
            dates,
            &mut self.annualized_volume,
            circulating_supply,
        );
    }
}

impl AnyDataset for TransactionDataset {
    fn get_min_initial_states(&self) -> &MinInitialStates {
        &self.min_initial_states
    }

    fn to_inserted_bi_map_vec(&self) -> Vec<&(dyn AnyBiMap + Send + Sync)> {
        vec![&self.count, &self.volume]
    }

    fn to_inserted_mut_bi_map_vec(&mut self) -> Vec<&mut dyn AnyBiMap> {
        vec![&mut self.count, &mut self.volume]
    }

    fn to_computed_bi_map_vec(&self) -> Vec<&(dyn AnyBiMap + Send + Sync)> {
        vec![&self.annualized_volume, &self.velocity]
    }

    fn to_computed_mut_bi_map_vec(&mut self) -> Vec<&mut dyn AnyBiMap> {
        vec![&mut self.annualized_volume, &mut self.velocity]
    }
}
