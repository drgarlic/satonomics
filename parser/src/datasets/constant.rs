use crate::structs::{AnyBiMap, BiMap};

use super::{AnyDataset, ComputeData, MinInitialStates};

pub struct ConstantDataset {
    min_initial_states: MinInitialStates,

    // Computed
    pub _50: BiMap<u16>,
    pub _100: BiMap<u16>,
}

impl ConstantDataset {
    pub fn import(parent_path: &str) -> color_eyre::Result<Self> {
        let f = |s: &str| format!("{parent_path}/{s}");

        let mut s = Self {
            min_initial_states: MinInitialStates::default(),

            _50: BiMap::new_bin(1, &f("50")),
            _100: BiMap::new_bin(1, &f("100")),
        };

        s.min_initial_states
            .consume(MinInitialStates::compute_from_dataset(&s));

        Ok(s)
    }

    pub fn compute(&mut self, &ComputeData { heights, dates }: &ComputeData) {
        self._50.multi_insert_const(heights, dates, 50);

        self._100.multi_insert_const(heights, dates, 100);
    }
}

impl AnyDataset for ConstantDataset {
    fn get_min_initial_states(&self) -> &MinInitialStates {
        &self.min_initial_states
    }

    fn to_computed_bi_map_vec(&self) -> Vec<&(dyn AnyBiMap + Send + Sync)> {
        vec![&self._50, &self._100]
    }

    fn to_computed_mut_bi_map_vec(&mut self) -> Vec<&mut dyn AnyBiMap> {
        vec![&mut self._50, &mut self._100]
    }
}
