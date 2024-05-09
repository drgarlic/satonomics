mod date;
mod height;
mod ohlc;

use date::*;
use height::*;
pub use ohlc::*;

use super::{AnyDataset, AnyDatasets, MinInitialState, ProcessedBlockData};

pub struct PriceDatasets {
    min_initial_state: MinInitialState,

    pub date: DateDataset,
    pub height: HeightDataset,
}

impl PriceDatasets {
    pub fn import(datasets_path: &str) -> color_eyre::Result<Self> {
        let price_path = "../price";

        let mut s = Self {
            min_initial_state: MinInitialState::default(),

            date: DateDataset::import(price_path, datasets_path)?,
            height: HeightDataset::import(price_path, datasets_path)?,
        };

        s.min_initial_state
            .consume(MinInitialState::compute_from_datasets(&s));

        Ok(s)
    }

    pub fn insert_data(&mut self, processed_block_data: &ProcessedBlockData) {
        self.date.insert_data(processed_block_data);
        self.height.insert_data(processed_block_data);
    }
}

impl AnyDatasets for PriceDatasets {
    fn get_min_initial_state(&self) -> &MinInitialState {
        &self.min_initial_state
    }

    fn to_any_dataset_vec(&self) -> Vec<&(dyn AnyDataset + Send + Sync)> {
        vec![&self.date, &self.height]
    }

    fn to_mut_any_dataset_vec(&mut self) -> Vec<&mut dyn AnyDataset> {
        vec![&mut self.date, &mut self.height]
    }
}
