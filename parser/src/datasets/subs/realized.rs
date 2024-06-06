use crate::{
    datasets::{AnyDataset, ComputeData, InsertData, MinInitialStates},
    states::RealizedState,
    structs::{AnyBiMap, BiMap},
};

/// TODO: Fix fees not taken into account ?
#[derive(Default)]
pub struct RealizedSubDataset {
    min_initial_states: MinInitialStates,

    // Inserted
    realized_profit: BiMap<f32>,
    realized_loss: BiMap<f32>,

    // Computed
    negative_realized_loss: BiMap<f32>,
    net_realized_profit_and_loss: BiMap<f32>,
    net_realized_profit_and_loss_relative_to_market_cap: BiMap<f32>,
}

impl RealizedSubDataset {
    pub fn import(parent_path: &str) -> color_eyre::Result<Self> {
        let f = |s: &str| format!("{parent_path}/{s}");

        let mut s = Self {
            min_initial_states: MinInitialStates::default(),

            realized_profit: BiMap::new_bin(1, &f("realized_profit")),
            realized_loss: BiMap::new_bin(1, &f("realized_loss")),
            negative_realized_loss: BiMap::new_bin(1, &f("negative_realized_loss")),
            net_realized_profit_and_loss: BiMap::new_bin(1, &f("net_realized_profit_and_loss")),
            net_realized_profit_and_loss_relative_to_market_cap: BiMap::new_bin(
                1,
                &f("net_realized_profit_and_loss_relative_to_market_cap"),
            ),
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
            date_blocks_range,
            ..
        }: &InsertData,
        height_state: &RealizedState,
    ) {
        self.realized_profit
            .height
            .insert(height, height_state.realized_profit);

        self.realized_loss
            .height
            .insert(height, height_state.realized_loss);

        if is_date_last_block {
            self.realized_profit
                .date_insert_sum_range(date, date_blocks_range);

            self.realized_loss
                .date_insert_sum_range(date, date_blocks_range);
        }
    }

    pub fn compute(
        &mut self,
        &ComputeData { heights, dates }: &ComputeData,
        market_cap: &mut BiMap<f32>,
    ) {
        self.negative_realized_loss.multi_insert_simple_transform(
            heights,
            dates,
            &mut self.realized_loss,
            &|v| v * 1.0,
        );

        self.net_realized_profit_and_loss.multi_insert_subtract(
            heights,
            dates,
            &mut self.realized_profit,
            &mut self.realized_loss,
        );

        self.net_realized_profit_and_loss_relative_to_market_cap
            .multi_insert_divide(
                heights,
                dates,
                &mut self.net_realized_profit_and_loss,
                market_cap,
            );
    }
}

impl AnyDataset for RealizedSubDataset {
    fn get_min_initial_states(&self) -> &MinInitialStates {
        &self.min_initial_states
    }

    fn to_inserted_bi_map_vec(&self) -> Vec<&(dyn AnyBiMap + Send + Sync)> {
        vec![&self.realized_loss, &self.realized_profit]
    }

    fn to_inserted_mut_bi_map_vec(&mut self) -> Vec<&mut dyn AnyBiMap> {
        vec![&mut self.realized_loss, &mut self.realized_profit]
    }

    fn to_computed_bi_map_vec(&self) -> Vec<&(dyn AnyBiMap + Send + Sync)> {
        vec![
            &self.negative_realized_loss,
            &self.net_realized_profit_and_loss,
            &self.net_realized_profit_and_loss_relative_to_market_cap,
        ]
    }

    fn to_computed_mut_bi_map_vec(&mut self) -> Vec<&mut dyn AnyBiMap> {
        vec![
            &mut self.negative_realized_loss,
            &mut self.net_realized_profit_and_loss,
            &mut self.net_realized_profit_and_loss_relative_to_market_cap,
        ]
    }
}
