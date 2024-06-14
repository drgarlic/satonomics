use allocative::Allocative;

use crate::{
    datasets::AnyDataset,
    structs::{AnyHeightMap, HeightMap, WNaiveDate},
};

use super::{InsertData, MinInitialStates};

#[derive(Allocative)]
pub struct BlockMetadataDataset {
    min_initial_states: MinInitialStates,

    // Inserted
    pub date: HeightMap<WNaiveDate>,
    pub timestamp: HeightMap<u32>,
}

impl BlockMetadataDataset {
    pub fn import(parent_path: &str) -> color_eyre::Result<Self> {
        let f = |s: &str| format!("{parent_path}/{s}");

        let mut s = Self {
            min_initial_states: MinInitialStates::default(),

            date: HeightMap::new_bin(1, &f("date")),
            timestamp: HeightMap::new_bin(1, &f("timestamp")),
        };

        s.min_initial_states
            .consume(MinInitialStates::compute_from_dataset(&s));

        Ok(s)
    }

    pub fn insert(
        &mut self,
        &InsertData {
            height, timestamp, ..
        }: &InsertData,
    ) {
        self.timestamp.insert(height, timestamp);

        self.date
            .insert(height, WNaiveDate::from_timestamp(timestamp));
    }
}

impl AnyDataset for BlockMetadataDataset {
    fn get_min_initial_states(&self) -> &MinInitialStates {
        &self.min_initial_states
    }

    fn to_inserted_height_map_vec(&self) -> Vec<&(dyn AnyHeightMap + Send + Sync)> {
        vec![&self.date, &self.timestamp]
    }

    fn to_inserted_mut_height_map_vec(&mut self) -> Vec<&mut dyn AnyHeightMap> {
        vec![&mut self.date, &mut self.timestamp]
    }
}
