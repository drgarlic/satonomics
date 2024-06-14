use allocative::Allocative;
use itertools::Itertools;

use crate::{
    datasets::{
        AnyDataset, AnyDatasetGroup, ComputeData, InsertData, MinInitialStates, SubDataset,
    },
    states::UTXOCohortId,
    structs::{AnyBiMap, AnyDateMap, AnyHeightMap, BiMap},
};

#[derive(Default, Allocative)]
pub struct UTXODataset {
    id: UTXOCohortId,

    min_initial_states: MinInitialStates,

    pub subs: SubDataset,
}

impl UTXODataset {
    pub fn import(parent_path: &str, id: UTXOCohortId) -> color_eyre::Result<Self> {
        let name = id.name();

        let folder_path = format!("{parent_path}/{name}");

        let mut s = Self {
            min_initial_states: MinInitialStates::default(),
            id,
            subs: SubDataset::import(&folder_path)?,
        };

        s.min_initial_states
            .consume(MinInitialStates::compute_from_dataset(&s));

        Ok(s)
    }

    pub fn insert(&mut self, insert_data: &InsertData) {
        let &InsertData {
            states,
            utxo_cohorts_one_shot_states,
            // utxo_cohorts_received_states,
            utxo_cohorts_sent_states,
            ..
        } = insert_data;

        if self.subs.supply.should_insert(insert_data) {
            self.subs.supply.insert(
                insert_data,
                &states
                    .utxo_cohorts_durable_states
                    .get(&self.id)
                    .durable_states
                    .supply_state,
            );
        }

        if self.subs.utxo.should_insert(insert_data) {
            self.subs.utxo.insert(
                insert_data,
                &states
                    .utxo_cohorts_durable_states
                    .get(&self.id)
                    .durable_states
                    .utxo_state,
            );
        }

        if self.subs.unrealized.should_insert(insert_data) {
            self.subs.unrealized.insert(
                insert_data,
                &utxo_cohorts_one_shot_states
                    .get(&self.id)
                    .unrealized_block_state,
                &utxo_cohorts_one_shot_states
                    .get(&self.id)
                    .unrealized_date_state,
            );
        }

        if self.subs.price_paid.should_insert(insert_data) {
            self.subs.price_paid.insert(
                insert_data,
                &utxo_cohorts_one_shot_states.get(&self.id).price_paid_state,
            );
        }

        if self.subs.realized.should_insert(insert_data) {
            self.subs.realized.insert(
                insert_data,
                &utxo_cohorts_sent_states.get(&self.id).realized,
            );
        }

        if self.subs.input.should_insert(insert_data) {
            self.subs
                .input
                .insert(insert_data, &utxo_cohorts_sent_states.get(&self.id).input);
        }

        // TODO: move output from common to address
        // if self.subs.output.should_insert(insert_data) {
        //     self.subs
        //         .output
        //         .insert(insert_data, utxo_cohorts_received_states.get(&self.id));
        // }
    }

    pub fn compute(
        &mut self,
        compute_data: &ComputeData,
        closes: &mut BiMap<f32>,
        circulating_supply: &mut BiMap<f64>,
        market_cap: &mut BiMap<f32>,
    ) {
        if self.subs.supply.should_compute(compute_data) {
            self.subs.supply.compute(compute_data, circulating_supply);
        }

        if self.subs.unrealized.should_compute(compute_data) {
            self.subs.unrealized.compute(
                compute_data,
                &mut self.subs.supply.supply,
                circulating_supply,
                market_cap,
            );
        }

        if self.subs.realized.should_compute(compute_data) {
            self.subs.realized.compute(compute_data, market_cap);
        }

        if self.subs.price_paid.should_compute(compute_data) {
            self.subs
                .price_paid
                .compute(compute_data, closes, &mut self.subs.supply.supply);
        }

        // if self.subs.output.should_compute(compute_data) {
        //     self.subs
        //         .output
        //         .compute(compute_data, &mut self.subs.supply.total);
        // }
    }
}

impl AnyDataset for UTXODataset {
    fn get_min_initial_states(&self) -> &MinInitialStates {
        &self.min_initial_states
    }

    fn to_inserted_height_map_vec(&self) -> Vec<&(dyn AnyHeightMap + Send + Sync)> {
        self.subs
            .as_vec()
            .into_iter()
            .flat_map(|d| d.to_inserted_height_map_vec())
            .collect_vec()
    }

    fn to_inserted_date_map_vec(&self) -> Vec<&(dyn AnyDateMap + Send + Sync)> {
        self.subs
            .as_vec()
            .into_iter()
            .flat_map(|d| d.to_inserted_date_map_vec())
            .collect_vec()
    }

    fn to_inserted_bi_map_vec(&self) -> Vec<&(dyn AnyBiMap + Send + Sync)> {
        self.subs
            .as_vec()
            .into_iter()
            .flat_map(|d| d.to_inserted_bi_map_vec())
            .collect_vec()
    }

    fn to_inserted_mut_height_map_vec(&mut self) -> Vec<&mut dyn AnyHeightMap> {
        self.subs
            .as_mut_vec()
            .into_iter()
            .flat_map(|d| d.to_inserted_mut_height_map_vec())
            .collect_vec()
    }

    fn to_inserted_mut_date_map_vec(&mut self) -> Vec<&mut dyn AnyDateMap> {
        self.subs
            .as_mut_vec()
            .into_iter()
            .flat_map(|d| d.to_inserted_mut_date_map_vec())
            .collect_vec()
    }

    fn to_inserted_mut_bi_map_vec(&mut self) -> Vec<&mut dyn AnyBiMap> {
        self.subs
            .as_mut_vec()
            .into_iter()
            .flat_map(|d| d.to_inserted_mut_bi_map_vec())
            .collect_vec()
    }

    fn to_computed_height_map_vec(&self) -> Vec<&(dyn AnyHeightMap + Send + Sync)> {
        self.subs
            .as_vec()
            .into_iter()
            .flat_map(|d| d.to_computed_height_map_vec())
            .collect_vec()
    }

    fn to_computed_date_map_vec(&self) -> Vec<&(dyn AnyDateMap + Send + Sync)> {
        self.subs
            .as_vec()
            .into_iter()
            .flat_map(|d| d.to_computed_date_map_vec())
            .collect_vec()
    }

    fn to_computed_bi_map_vec(&self) -> Vec<&(dyn AnyBiMap + Send + Sync)> {
        self.subs
            .as_vec()
            .into_iter()
            .flat_map(|d| d.to_computed_bi_map_vec())
            .collect_vec()
    }

    fn to_computed_mut_height_map_vec(&mut self) -> Vec<&mut dyn AnyHeightMap> {
        self.subs
            .as_mut_vec()
            .into_iter()
            .flat_map(|d| d.to_computed_mut_height_map_vec())
            .collect_vec()
    }

    fn to_computed_mut_date_map_vec(&mut self) -> Vec<&mut dyn AnyDateMap> {
        self.subs
            .as_mut_vec()
            .into_iter()
            .flat_map(|d| d.to_computed_mut_date_map_vec())
            .collect_vec()
    }

    fn to_computed_mut_bi_map_vec(&mut self) -> Vec<&mut dyn AnyBiMap> {
        self.subs
            .as_mut_vec()
            .into_iter()
            .flat_map(|d| d.to_computed_mut_bi_map_vec())
            .collect_vec()
    }
}
