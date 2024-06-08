mod dataset;

use dataset::*;
use rayon::prelude::*;

use itertools::Itertools;

use crate::{
    datasets::AnyDatasets,
    states::{SplitByUTXOCohort, UTXOCohortId},
    structs::BiMap,
};

use super::{AnyDataset, ComputeData, InsertData, MinInitialStates};

pub struct UTXODatasets {
    min_initial_states: MinInitialStates,

    cohorts: SplitByUTXOCohort<UTXODataset>,
}

impl UTXODatasets {
    pub fn import(parent_path: &str) -> color_eyre::Result<Self> {
        let mut cohorts = SplitByUTXOCohort::<UTXODataset>::default();

        cohorts
            .as_vec()
            .into_par_iter()
            .map(|(_, id)| (id, UTXODataset::import(parent_path, id)))
            .collect::<Vec<_>>()
            .into_iter()
            .try_for_each(|(id, dataset)| -> color_eyre::Result<()> {
                *cohorts.get_mut(&id) = dataset?;
                Ok(())
            })?;

        let mut s = Self {
            min_initial_states: MinInitialStates::default(),

            cohorts,
        };

        s.min_initial_states
            .consume(MinInitialStates::compute_from_datasets(&s));

        Ok(s)
    }

    pub fn insert(&mut self, insert_data: &InsertData) {
        self.cohorts
            .as_mut_vec()
            .into_iter()
            .for_each(|(cohort, _)| cohort.insert(insert_data))
    }

    pub fn compute(
        &mut self,
        compute_data: &ComputeData,
        closes: &mut BiMap<f32>,
        circulating_supply: &mut BiMap<f64>,
        market_cap: &mut BiMap<f32>,
    ) {
        self.cohorts
            .as_mut_vec()
            .into_iter()
            .for_each(|(cohort, _)| {
                cohort.compute(compute_data, closes, circulating_supply, market_cap)
            })
    }

    fn as_vec(&self) -> Vec<(&UTXODataset, UTXOCohortId)> {
        self.cohorts.as_vec()
    }

    fn as_mut_vec(&mut self) -> Vec<(&mut UTXODataset, UTXOCohortId)> {
        self.cohorts.as_mut_vec()
    }
}

impl AnyDatasets for UTXODatasets {
    fn get_min_initial_states(&self) -> &MinInitialStates {
        &self.min_initial_states
    }

    fn to_any_dataset_vec(&self) -> Vec<&(dyn AnyDataset + Send + Sync)> {
        self.as_vec()
            .into_iter()
            .map(|(dataset, _)| dataset as &(dyn AnyDataset + Send + Sync))
            .collect_vec()
    }

    fn to_mut_any_dataset_vec(&mut self) -> Vec<&mut dyn AnyDataset> {
        self.as_mut_vec()
            .into_iter()
            .map(|(dataset, _)| dataset as &mut dyn AnyDataset)
            .collect_vec()
    }
}
