use crate::{
    bitcoin::sats_to_btc,
    datasets::{AnyDataset, MinInitialState, ProcessedBlockData},
    states::SupplyState,
    structs::{AnyBiMap, BiMap},
};

pub struct SupplySubDataset {
    min_initial_state: MinInitialState,

    pub total: BiMap<f32>,
    pub market_cap: BiMap<f32>,
}

impl SupplySubDataset {
    pub fn import(parent_path: &str) -> color_eyre::Result<Self> {
        let f = |s: &str| format!("{parent_path}/{s}");

        let mut s = Self {
            min_initial_state: MinInitialState::default(),

            total: BiMap::_new_bin(1, &f("supply"), usize::MAX),
            market_cap: BiMap::_new_bin(1, &f("market_cap"), usize::MAX),
        };

        s.min_initial_state
            .consume(MinInitialState::compute_from_dataset(&s));

        Ok(s)
    }

    pub fn insert(
        &mut self,
        &ProcessedBlockData {
            height,
            date,
            is_date_last_block,
            date_price,
            block_price,
            ..
        }: &ProcessedBlockData,
        state: &SupplyState,
    ) {
        let total_supply = self.total.height.insert(height, sats_to_btc(state.supply));

        self.market_cap
            .height
            .insert(height, total_supply * block_price);

        if is_date_last_block {
            self.total.date.insert(date, total_supply);

            self.market_cap.date.insert(date, total_supply * date_price);
        }
    }
}

impl AnyDataset for SupplySubDataset {
    fn get_min_initial_state(&self) -> &MinInitialState {
        &self.min_initial_state
    }

    fn to_any_bi_map_vec(&self) -> Vec<&(dyn AnyBiMap + Send + Sync)> {
        vec![&self.total, &self.market_cap]
    }

    fn to_any_mut_bi_map_vec(&mut self) -> Vec<&mut dyn AnyBiMap> {
        vec![&mut self.total, &mut self.market_cap]
    }
}
