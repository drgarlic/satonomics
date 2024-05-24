use crate::{
    datasets::{AnyDataset, InsertData, MinInitialStates},
    structs::{AnyBiMap, BiMap},
};

pub struct MetadataDataset {
    min_initial_states: MinInitialStates,

    // Inserted
    address_count: BiMap<usize>,
    // Sending addresses
    // Receiving addresses
    // Active addresses (Unique(Sending + Receiving))
}

impl MetadataDataset {
    pub fn import(parent_path: &str) -> color_eyre::Result<Self> {
        let f = |s: &str| format!("{parent_path}/{s}");

        let mut s = Self {
            min_initial_states: MinInitialStates::default(),

            address_count: BiMap::new_bin(1, &f("address_count")),
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
        address_count: usize,
    ) {
        self.address_count.height.insert(height, address_count);

        if is_date_last_block {
            self.address_count.date.insert(date, address_count);
        }
    }
}

impl AnyDataset for MetadataDataset {
    fn get_min_initial_states(&self) -> &MinInitialStates {
        &self.min_initial_states
    }

    fn to_inserted_bi_map_vec(&self) -> Vec<&(dyn AnyBiMap + Send + Sync)> {
        vec![&self.address_count]
    }

    fn to_inserted_mut_bi_map_vec(&mut self) -> Vec<&mut dyn AnyBiMap> {
        vec![&mut self.address_count]
    }
}
