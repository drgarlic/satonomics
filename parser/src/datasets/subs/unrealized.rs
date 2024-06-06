use crate::{
    datasets::{AnyDataset, ComputeData, InsertData, MinInitialStates},
    states::UnrealizedState,
    structs::{AnyBiMap, BiMap},
};

#[derive(Default)]
pub struct UnrealizedSubDataset {
    min_initial_states: MinInitialStates,

    // Inserted
    supply_in_profit: BiMap<f64>,
    unrealized_profit: BiMap<f32>,
    unrealized_loss: BiMap<f32>,

    // Computed
    supply_in_loss: BiMap<f64>,
}

impl UnrealizedSubDataset {
    pub fn import(parent_path: &str) -> color_eyre::Result<Self> {
        let f = |s: &str| format!("{parent_path}/{s}");

        let mut s = Self {
            min_initial_states: MinInitialStates::default(),

            supply_in_profit: BiMap::new_bin(1, &f("supply_in_profit")),
            supply_in_loss: BiMap::new_bin(1, &f("supply_in_loss")),
            unrealized_profit: BiMap::new_bin(1, &f("unrealized_profit")),
            unrealized_loss: BiMap::new_bin(1, &f("unrealized_loss")),
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
        block_state: &UnrealizedState,
        date_state: &Option<UnrealizedState>,
    ) {
        self.supply_in_profit
            .height
            .insert(height, block_state.supply_in_profit.to_btc());

        self.unrealized_profit
            .height
            .insert(height, block_state.unrealized_profit);

        self.unrealized_loss
            .height
            .insert(height, block_state.unrealized_loss);

        if is_date_last_block {
            let date_state = date_state.as_ref().unwrap();

            self.supply_in_profit
                .date
                .insert(date, date_state.supply_in_profit.to_btc());

            self.unrealized_profit
                .date
                .insert(date, date_state.unrealized_profit);

            self.unrealized_loss
                .date
                .insert(date, date_state.unrealized_loss);
        }
    }

    pub fn compute(
        &mut self,
        &ComputeData { heights, dates }: &ComputeData,
        cohort_supply: &mut BiMap<f64>,
    ) {
        self.supply_in_loss.multi_insert_subtract(
            heights,
            dates,
            cohort_supply,
            &mut self.supply_in_profit,
        );
    }
}

impl AnyDataset for UnrealizedSubDataset {
    fn get_min_initial_states(&self) -> &MinInitialStates {
        &self.min_initial_states
    }

    fn to_inserted_bi_map_vec(&self) -> Vec<&(dyn AnyBiMap + Send + Sync)> {
        vec![
            &self.supply_in_profit,
            &self.unrealized_profit,
            &self.unrealized_loss,
        ]
    }

    fn to_inserted_mut_bi_map_vec(&mut self) -> Vec<&mut dyn AnyBiMap> {
        vec![
            &mut self.supply_in_profit,
            &mut self.unrealized_profit,
            &mut self.unrealized_loss,
        ]
    }

    fn to_computed_bi_map_vec(&self) -> Vec<&(dyn AnyBiMap + Send + Sync)> {
        vec![&self.supply_in_loss]
    }

    fn to_computed_mut_bi_map_vec(&mut self) -> Vec<&mut dyn AnyBiMap> {
        vec![&mut self.supply_in_loss]
    }
}
