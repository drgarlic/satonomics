use crate::{
    datasets::{AnyDataset, MinInitialState, ProcessedBlockData},
    structs::{AnyBiMap, BiMap},
};

pub struct AllAddressesMetadataDataset {
    min_initial_state: MinInitialState,

    created_addreses: BiMap<u32>,
    empty_addresses: BiMap<u32>,
    new_addresses: BiMap<u32>,
}

impl AllAddressesMetadataDataset {
    pub fn import(parent_path: &str) -> color_eyre::Result<Self> {
        let f = |s: &str| format!("{parent_path}/{s}");

        let mut s = Self {
            min_initial_state: MinInitialState::default(),

            // TODO: Shouldn't be (like many others)
            created_addreses: BiMap::_new_bin(1, &f("created_addresses"), usize::MAX),
            empty_addresses: BiMap::new_bin(1, &f("empty_addresses")),
            new_addresses: BiMap::new_bin(1, &f("new_addresses")),
        };

        s.min_initial_state
            .consume(MinInitialState::compute_from_dataset(&s));

        Ok(s)
    }

    pub fn insert_data(&mut self, processed_block_data: &ProcessedBlockData) {
        let &ProcessedBlockData {
            databases,
            height,
            date,
            is_date_last_block,
            ..
        } = processed_block_data;

        let created_addresses = self
            .created_addreses
            .height
            .insert(height, *databases.address_to_address_index.metadata.len);

        let previous_created_addresses = height.checked_sub(1).map_or(0, |prev_height| {
            self.created_addreses.height.get(&prev_height).unwrap()
        });

        let new_addresses = self
            .new_addresses
            .height
            .insert(height, created_addresses - previous_created_addresses);

        let empty_addresses = self.empty_addresses.height.insert(
            height,
            *databases.address_index_to_empty_address_data.metadata.len,
        );

        if is_date_last_block {
            self.created_addreses.date.insert(date, created_addresses);

            self.empty_addresses.date.insert(date, empty_addresses);

            self.new_addresses.date.insert(date, new_addresses);
        }
    }
}

impl AnyDataset for AllAddressesMetadataDataset {
    fn get_min_initial_state(&self) -> &MinInitialState {
        &self.min_initial_state
    }

    fn to_any_bi_map_vec(&self) -> Vec<&(dyn AnyBiMap + Send + Sync)> {
        vec![
            &self.created_addreses,
            &self.empty_addresses,
            &self.new_addresses,
        ]
    }

    fn to_any_mut_bi_map_vec(&mut self) -> Vec<&mut dyn AnyBiMap> {
        vec![
            &mut self.created_addreses,
            &mut self.empty_addresses,
            &mut self.new_addresses,
        ]
    }
}
