use crate::{
    datasets::{AnyDataset, ComputeData, InsertData, MinInitialStates},
    states::SupplyState,
    structs::{AnyBiMap, BiMap, DateMap, HeightMap},
};

#[derive(Default)]
pub struct SupplySubDataset {
    min_initial_states: MinInitialStates,

    // Inserted
    pub total: BiMap<f64>,
}

impl SupplySubDataset {
    pub fn import(parent_path: &str) -> color_eyre::Result<Self> {
        let f = |s: &str| format!("{parent_path}/{s}");

        let mut s = Self {
            min_initial_states: MinInitialStates::default(),

            total: BiMap::_new_bin(1, &f("supply"), usize::MAX),
            // market_cap: BiMap::_new_bin(1, &f("market_cap"), usize::MAX),
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
            is_date_last_block,
            ..
        }: &InsertData,
        state: &SupplyState,
    ) {
        let total_supply = self.total.height.insert(height, state.supply.to_btc());

        if is_date_last_block {
            self.total.date.insert(date, total_supply);
        }
    }

    #[allow(unused_variables)]
    pub fn compute(
        &mut self,
        &ComputeData { heights, dates }: &ComputeData,
        date_closes: &mut DateMap<f32>,
        height_closes: &mut HeightMap<f32>,
    ) {
        // self.market_cap.height.multi_insert_multiply(
        //     heights,
        //     &mut self.total.height,
        //     height_closes,
        // );
        // self.market_cap
        //     .date
        //     .multi_insert_multiply(dates, &mut self.total.date, date_closes);
    }
}

impl AnyDataset for SupplySubDataset {
    fn get_min_initial_states(&self) -> &MinInitialStates {
        &self.min_initial_states
    }

    fn to_inserted_bi_map_vec(&self) -> Vec<&(dyn AnyBiMap + Send + Sync)> {
        vec![&self.total]
    }

    fn to_inserted_mut_bi_map_vec(&mut self) -> Vec<&mut dyn AnyBiMap> {
        vec![&mut self.total]
    }

    fn to_computed_bi_map_vec(&self) -> Vec<&(dyn AnyBiMap + Send + Sync)> {
        vec![
            // &self.market_cap
        ]
    }

    fn to_computed_mut_bi_map_vec(&mut self) -> Vec<&mut dyn AnyBiMap> {
        vec![
            // &mut self.market_cap
        ]
    }
}
