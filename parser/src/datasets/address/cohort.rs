use itertools::Itertools;

use crate::{
    datasets::{
        AnyDataset, AnyDatasetGroup, ComputeData, InsertData, MinInitialStates, SubDataset,
    },
    states::AddressCohortDurableStates,
    structs::{AddressSplit, AnyBiMap, AnyDateMap, AnyHeightMap},
    DateMap, HeightMap,
};

use super::cohort_metadata::MetadataDataset;

pub struct CohortDataset {
    min_initial_states: MinInitialStates,

    split: AddressSplit,

    metadata: MetadataDataset,

    pub all: SubDataset,
    illiquid: SubDataset,
    liquid: SubDataset,
    highly_liquid: SubDataset,
}

impl CohortDataset {
    pub fn import(
        parent_path: &str,
        name: Option<&str>,
        split: AddressSplit,
    ) -> color_eyre::Result<Self> {
        let folder_path = {
            if let Some(name) = name {
                format!("{parent_path}/{name}")
            } else {
                parent_path.to_owned()
            }
        };

        let f = |s: &str| {
            if let Some(name) = name {
                format!("{parent_path}/{s}/{name}")
            } else {
                format!("{parent_path}/{s}")
            }
        };

        let mut s = Self {
            min_initial_states: MinInitialStates::default(),

            split,

            metadata: MetadataDataset::import(&folder_path)?,
            all: SubDataset::import(&folder_path)?,
            illiquid: SubDataset::import(&f("illiquid"))?,
            liquid: SubDataset::import(&f("liquid"))?,
            highly_liquid: SubDataset::import(&f("highly_liquid"))?,
        };

        s.min_initial_states
            .consume(MinInitialStates::compute_from_dataset(&s));

        Ok(s)
    }

    pub fn sub_datasets_vec(&self) -> Vec<&SubDataset> {
        vec![&self.all, &self.illiquid, &self.liquid, &self.highly_liquid]
    }

    pub fn should_insert_metadata(&self, insert_data: &InsertData) -> bool {
        self.metadata.should_insert(insert_data)
    }

    pub fn should_insert_utxo(&self, insert_data: &InsertData) -> bool {
        self.sub_datasets_vec()
            .iter()
            .any(|sub| sub.utxo.should_insert(insert_data))
    }

    pub fn should_insert_supply(&self, insert_data: &InsertData) -> bool {
        self.sub_datasets_vec()
            .iter()
            .any(|sub| sub.supply.should_insert(insert_data))
    }

    pub fn should_insert_price_paid(&self, insert_data: &InsertData) -> bool {
        self.sub_datasets_vec()
            .iter()
            .any(|sub| sub.price_paid.should_insert(insert_data))
    }

    fn should_insert_realized(&self, insert_data: &InsertData) -> bool {
        self.sub_datasets_vec()
            .iter()
            .any(|sub| sub.realized.should_insert(insert_data))
    }

    fn should_insert_unrealized(&self, insert_data: &InsertData) -> bool {
        self.sub_datasets_vec()
            .iter()
            .any(|sub| sub.unrealized.should_insert(insert_data))
    }

    fn should_insert_input(&self, insert_data: &InsertData) -> bool {
        self.sub_datasets_vec()
            .iter()
            .any(|sub| sub.input.should_insert(insert_data))
    }

    fn should_insert_output(&self, insert_data: &InsertData) -> bool {
        self.sub_datasets_vec()
            .iter()
            .any(|sub| sub.output.should_insert(insert_data))
    }

    fn insert_realized_data(&mut self, insert_data: &InsertData) {
        let split_realized_state = insert_data
            .address_cohorts_realized_states
            .as_ref()
            .unwrap()
            .get_state(&self.split)
            .unwrap();

        self.all
            .realized
            .insert(insert_data, &split_realized_state.all);

        self.illiquid
            .realized
            .insert(insert_data, &split_realized_state.illiquid);

        self.liquid
            .realized
            .insert(insert_data, &split_realized_state.liquid);

        self.highly_liquid
            .realized
            .insert(insert_data, &split_realized_state.highly_liquid);
    }

    fn insert_metadata(&mut self, insert_data: &InsertData) {
        let address_count = insert_data
            .states
            .address_cohorts_durable_states
            .get_state(&self.split)
            .unwrap()
            .address_count;

        self.metadata.insert(insert_data, address_count);
    }

    fn insert_supply_data(
        &mut self,
        insert_data: &InsertData,
        liquidity_split_state: &AddressCohortDurableStates,
    ) {
        self.all
            .supply
            .insert(insert_data, &liquidity_split_state.split.all.supply_state);

        self.illiquid.supply.insert(
            insert_data,
            &liquidity_split_state.split.illiquid.supply_state,
        );

        self.liquid.supply.insert(
            insert_data,
            &liquidity_split_state.split.liquid.supply_state,
        );

        self.highly_liquid.supply.insert(
            insert_data,
            &liquidity_split_state.split.highly_liquid.supply_state,
        );
    }

    fn insert_utxo_data(
        &mut self,
        insert_data: &InsertData,
        liquidity_split_state: &AddressCohortDurableStates,
    ) {
        self.all
            .utxo
            .insert(insert_data, &liquidity_split_state.split.all.utxo_state);

        self.illiquid.utxo.insert(
            insert_data,
            &liquidity_split_state.split.illiquid.utxo_state,
        );

        self.liquid
            .utxo
            .insert(insert_data, &liquidity_split_state.split.liquid.utxo_state);

        self.highly_liquid.utxo.insert(
            insert_data,
            &liquidity_split_state.split.highly_liquid.utxo_state,
        );
    }

    fn insert_unrealized_data(&mut self, insert_data: &InsertData) {
        let states = insert_data
            .address_cohorts_one_shot_states
            .as_ref()
            .unwrap()
            .get_state(&self.split)
            .unwrap();

        self.all.unrealized.insert(
            insert_data,
            &states.all.unrealized_block_state,
            &states.all.unrealized_date_state,
        );

        self.illiquid.unrealized.insert(
            insert_data,
            &states.illiquid.unrealized_block_state,
            &states.illiquid.unrealized_date_state,
        );

        self.liquid.unrealized.insert(
            insert_data,
            &states.liquid.unrealized_block_state,
            &states.liquid.unrealized_date_state,
        );

        self.highly_liquid.unrealized.insert(
            insert_data,
            &states.highly_liquid.unrealized_block_state,
            &states.highly_liquid.unrealized_date_state,
        );
    }

    fn insert_price_paid_data(&mut self, insert_data: &InsertData) {
        let states = insert_data
            .address_cohorts_one_shot_states
            .as_ref()
            .unwrap()
            .get_state(&self.split)
            .unwrap();

        self.all
            .price_paid
            .insert(insert_data, &states.all.price_paid_state);

        self.illiquid
            .price_paid
            .insert(insert_data, &states.illiquid.price_paid_state);

        self.liquid
            .price_paid
            .insert(insert_data, &states.liquid.price_paid_state);

        self.highly_liquid
            .price_paid
            .insert(insert_data, &states.highly_liquid.price_paid_state);
    }

    fn insert_input_data(&mut self, insert_data: &InsertData) {
        let state = insert_data
            .address_cohorts_input_states
            .as_ref()
            .unwrap()
            .get_state(&self.split)
            .unwrap();

        self.all.input.insert(insert_data, &state.all);
        self.illiquid.input.insert(insert_data, &state.illiquid);
        self.liquid.input.insert(insert_data, &state.liquid);
        self.highly_liquid
            .input
            .insert(insert_data, &state.highly_liquid);
    }

    fn insert_output_data(&mut self, insert_data: &InsertData) {
        let state = insert_data
            .address_cohorts_output_states
            .as_ref()
            .unwrap()
            .get_state(&self.split)
            .unwrap();

        self.all.output.insert(insert_data, &state.all);
        self.illiquid.output.insert(insert_data, &state.illiquid);
        self.liquid.output.insert(insert_data, &state.liquid);
        self.highly_liquid
            .output
            .insert(insert_data, &state.highly_liquid);
    }

    fn as_vec(&self) -> Vec<&(dyn AnyDataset + Send + Sync)> {
        vec![
            self.all.as_vec(),
            self.illiquid.as_vec(),
            self.liquid.as_vec(),
            self.highly_liquid.as_vec(),
            vec![&self.metadata],
        ]
        .into_iter()
        .flatten()
        .collect_vec()
    }

    fn as_mut_vec(&mut self) -> Vec<&mut dyn AnyDataset> {
        vec![
            self.all.as_mut_vec(),
            self.illiquid.as_mut_vec(),
            self.liquid.as_mut_vec(),
            self.highly_liquid.as_mut_vec(),
            vec![&mut self.metadata],
        ]
        .into_iter()
        .flatten()
        .collect_vec()
    }

    pub fn insert(&mut self, insert_data: &InsertData) {
        let liquidity_split_processed_address_state = insert_data
            .states
            .address_cohorts_durable_states
            .get_state(&self.split);

        if liquidity_split_processed_address_state.is_none() {
            return; // TODO: Check if should panic instead
        }

        let liquidity_split_processed_address_state =
            liquidity_split_processed_address_state.unwrap();

        if self.should_insert_metadata(insert_data) {
            self.insert_metadata(insert_data);
        }

        if self.should_insert_utxo(insert_data) {
            self.insert_utxo_data(insert_data, liquidity_split_processed_address_state);
        }

        if self.should_insert_supply(insert_data) {
            self.insert_supply_data(insert_data, liquidity_split_processed_address_state);
        }

        if self.should_insert_realized(insert_data) {
            self.insert_realized_data(insert_data);
        }

        if self.should_insert_unrealized(insert_data) {
            self.insert_unrealized_data(insert_data);
        }

        // MUST BE after insert_supply
        if self.should_insert_price_paid(insert_data) {
            self.insert_price_paid_data(insert_data);
        }

        if self.should_insert_input(insert_data) {
            self.insert_input_data(insert_data);
        }

        if self.should_insert_output(insert_data) {
            self.insert_output_data(insert_data);
        }
    }

    // pub fn should_compute_metadata(&self, compute_data: &ComputeData) -> bool {
    //     self.metadata.should_compute(compute_data)
    // }

    // pub fn should_compute_utxo(&self, compute_data: &ComputeData) -> bool {
    //     self.sub_datasets_vec()
    //         .iter()
    //         .any(|sub| sub.utxo.should_compute(compute_data))
    // }

    pub fn should_compute_supply(&self, compute_data: &ComputeData) -> bool {
        self.sub_datasets_vec()
            .iter()
            .any(|sub| sub.supply.should_compute(compute_data))
    }

    pub fn should_compute_price_paid(&self, compute_data: &ComputeData) -> bool {
        self.sub_datasets_vec()
            .iter()
            .any(|sub| sub.price_paid.should_compute(compute_data))
    }

    // fn should_compute_realized(&self, compute_data: &ComputeData) -> bool {
    //     self.sub_datasets_vec()
    //         .iter()
    //         .any(|sub| sub.realized.should_compute(compute_data))
    // }

    fn should_compute_unrealized(&self, compute_data: &ComputeData) -> bool {
        self.sub_datasets_vec()
            .iter()
            .any(|sub| sub.unrealized.should_compute(compute_data))
    }

    // fn should_compute_input(&self, compute_data: &ComputeData) -> bool {
    //     self.sub_datasets_vec()
    //         .iter()
    //         .any(|sub| sub.input.should_compute(compute_data))
    // }

    fn should_compute_output(&self, compute_data: &ComputeData) -> bool {
        self.sub_datasets_vec()
            .iter()
            .any(|sub| sub.output.should_compute(compute_data))
    }

    fn compute_supply_data(
        &mut self,
        compute_data: &ComputeData,
        date_closes: &mut DateMap<f32>,
        height_closes: &mut HeightMap<f32>,
    ) {
        self.all
            .supply
            .compute(compute_data, date_closes, height_closes);

        self.illiquid
            .supply
            .compute(compute_data, date_closes, height_closes);

        self.liquid
            .supply
            .compute(compute_data, date_closes, height_closes);

        self.highly_liquid
            .supply
            .compute(compute_data, date_closes, height_closes);
    }

    fn compute_unrealized_data(&mut self, compute_data: &ComputeData) {
        self.all
            .unrealized
            .compute(compute_data, &mut self.all.supply.total);

        self.illiquid
            .unrealized
            .compute(compute_data, &mut self.illiquid.supply.total);

        self.liquid
            .unrealized
            .compute(compute_data, &mut self.liquid.supply.total);

        self.highly_liquid
            .unrealized
            .compute(compute_data, &mut self.highly_liquid.supply.total);
    }

    fn compute_price_paid_data(
        &mut self,
        compute_data: &ComputeData,
        date_closes: &mut DateMap<f32>,
        height_closes: &mut HeightMap<f32>,
    ) {
        self.all.price_paid.compute(
            compute_data,
            date_closes,
            height_closes,
            &mut self.all.supply.total,
        );

        self.illiquid.price_paid.compute(
            compute_data,
            date_closes,
            height_closes,
            &mut self.illiquid.supply.total,
        );

        self.liquid.price_paid.compute(
            compute_data,
            date_closes,
            height_closes,
            &mut self.liquid.supply.total,
        );

        self.highly_liquid.price_paid.compute(
            compute_data,
            date_closes,
            height_closes,
            &mut self.highly_liquid.supply.total,
        );
    }

    fn compute_output_data(&mut self, compute_data: &ComputeData) {
        self.all
            .output
            .compute(compute_data, &mut self.all.supply.total);

        self.illiquid
            .output
            .compute(compute_data, &mut self.illiquid.supply.total);

        self.liquid
            .output
            .compute(compute_data, &mut self.liquid.supply.total);

        self.highly_liquid
            .output
            .compute(compute_data, &mut self.highly_liquid.supply.total);
    }

    pub fn compute(
        &mut self,
        compute_data: &ComputeData,
        date_closes: &mut DateMap<f32>,
        height_closes: &mut HeightMap<f32>,
    ) {
        if self.should_compute_supply(compute_data) {
            self.compute_supply_data(compute_data, date_closes, height_closes);
        }

        if self.should_compute_unrealized(compute_data) {
            self.compute_unrealized_data(compute_data);
        }

        // MUST BE after compute_supply
        if self.should_compute_price_paid(compute_data) {
            self.compute_price_paid_data(compute_data, date_closes, height_closes);
        }

        if self.should_compute_output(compute_data) {
            self.compute_output_data(compute_data);
        }
    }
}

impl AnyDataset for CohortDataset {
    fn to_inserted_height_map_vec(&self) -> Vec<&(dyn AnyHeightMap + Send + Sync)> {
        self.as_vec()
            .into_iter()
            .flat_map(|d| d.to_inserted_height_map_vec())
            .collect_vec()
    }

    fn to_inserted_date_map_vec(&self) -> Vec<&(dyn AnyDateMap + Send + Sync)> {
        self.as_vec()
            .into_iter()
            .flat_map(|d| d.to_inserted_date_map_vec())
            .collect_vec()
    }

    fn to_inserted_bi_map_vec(&self) -> Vec<&(dyn AnyBiMap + Send + Sync)> {
        self.as_vec()
            .into_iter()
            .flat_map(|d| d.to_inserted_bi_map_vec())
            .collect_vec()
    }

    fn to_inserted_mut_height_map_vec(&mut self) -> Vec<&mut dyn AnyHeightMap> {
        self.as_mut_vec()
            .into_iter()
            .flat_map(|d| d.to_inserted_mut_height_map_vec())
            .collect_vec()
    }

    fn to_inserted_mut_date_map_vec(&mut self) -> Vec<&mut dyn AnyDateMap> {
        self.as_mut_vec()
            .into_iter()
            .flat_map(|d| d.to_inserted_mut_date_map_vec())
            .collect_vec()
    }

    fn to_inserted_mut_bi_map_vec(&mut self) -> Vec<&mut dyn AnyBiMap> {
        self.as_mut_vec()
            .into_iter()
            .flat_map(|d| d.to_inserted_mut_bi_map_vec())
            .collect_vec()
    }

    fn to_computed_height_map_vec(&self) -> Vec<&(dyn AnyHeightMap + Send + Sync)> {
        self.as_vec()
            .into_iter()
            .flat_map(|d| d.to_computed_height_map_vec())
            .collect_vec()
    }

    fn to_computed_date_map_vec(&self) -> Vec<&(dyn AnyDateMap + Send + Sync)> {
        self.as_vec()
            .into_iter()
            .flat_map(|d| d.to_computed_date_map_vec())
            .collect_vec()
    }

    fn to_computed_bi_map_vec(&self) -> Vec<&(dyn AnyBiMap + Send + Sync)> {
        self.as_vec()
            .into_iter()
            .flat_map(|d| d.to_computed_bi_map_vec())
            .collect_vec()
    }

    fn to_computed_mut_height_map_vec(&mut self) -> Vec<&mut dyn AnyHeightMap> {
        self.as_mut_vec()
            .into_iter()
            .flat_map(|d| d.to_computed_mut_height_map_vec())
            .collect_vec()
    }

    fn to_computed_mut_date_map_vec(&mut self) -> Vec<&mut dyn AnyDateMap> {
        self.as_mut_vec()
            .into_iter()
            .flat_map(|d| d.to_computed_mut_date_map_vec())
            .collect_vec()
    }

    fn to_computed_mut_bi_map_vec(&mut self) -> Vec<&mut dyn AnyBiMap> {
        self.as_mut_vec()
            .into_iter()
            .flat_map(|d| d.to_computed_mut_bi_map_vec())
            .collect_vec()
    }

    fn get_min_initial_states(&self) -> &MinInitialStates {
        &self.min_initial_states
    }
}
