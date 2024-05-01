mod date;
mod height;
mod ohlc;

use date::*;
use height::*;
pub use ohlc::*;

use super::{AnyDataset, AnyDatasets, MinInitialState};

pub struct PriceDatasets {
    min_initial_state: MinInitialState,

    pub date: DateDataset,
    pub height: HeightDataset,
}

impl PriceDatasets {
    pub fn import() -> color_eyre::Result<Self> {
        let path = "../price/ohlc";

        let mut s = Self {
            min_initial_state: MinInitialState::default(),

            date: DateDataset::import(path)?,
            height: HeightDataset::import(path)?,
        };

        s.min_initial_state
            .consume(MinInitialState::compute_from_datasets(&s));

        Ok(s)
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
