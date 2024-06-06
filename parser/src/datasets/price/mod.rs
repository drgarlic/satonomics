mod date;
mod height;
mod ohlc;

use date::*;
use height::*;
pub use ohlc::*;

use crate::structs::BiMap;

use super::{AnyDataset, AnyDatasets, ComputeData, MinInitialStates};

pub struct PriceDatasets {
    min_initial_states: MinInitialStates,

    pub date: DateDataset,
    pub height: HeightDataset,
}

impl PriceDatasets {
    pub fn import(datasets_path: &str) -> color_eyre::Result<Self> {
        let price_path = "../price";

        let mut s = Self {
            min_initial_states: MinInitialStates::default(),

            date: DateDataset::import(price_path, datasets_path)?,
            height: HeightDataset::import(price_path, datasets_path)?,
        };

        s.min_initial_states
            .consume(MinInitialStates::compute_from_datasets(&s));

        Ok(s)
    }

    pub fn compute(&mut self, compute_data: &ComputeData, circulating_supply: &mut BiMap<f64>) {
        self.height
            .compute(compute_data, &mut circulating_supply.height);

        self.date
            .compute(compute_data, &mut circulating_supply.date);
    }
}

impl AnyDatasets for PriceDatasets {
    fn get_min_initial_states(&self) -> &MinInitialStates {
        &self.min_initial_states
    }

    fn to_any_dataset_vec(&self) -> Vec<&(dyn AnyDataset + Send + Sync)> {
        vec![&self.date, &self.height]
    }

    fn to_mut_any_dataset_vec(&mut self) -> Vec<&mut dyn AnyDataset> {
        vec![&mut self.date, &mut self.height]
    }
}
