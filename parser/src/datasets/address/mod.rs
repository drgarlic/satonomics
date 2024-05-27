mod all_metadata;
mod cohort;
mod cohort_metadata;

use std::thread;

use itertools::Itertools;

use crate::{
    states::SplitByAddressCohort,
    structs::{AddressSize, AddressSplit, AddressType, DateMap, HeightMap},
};

use self::{all_metadata::AllAddressesMetadataDataset, cohort::CohortDataset};

use super::{AnyDataset, AnyDatasets, ComputeData, InsertData, MinInitialStates};

pub struct AddressDatasets {
    min_initial_states: MinInitialStates,

    metadata: AllAddressesMetadataDataset,

    pub cohorts: SplitByAddressCohort<CohortDataset>,
}

impl AddressDatasets {
    pub fn import(parent_path: &str) -> color_eyre::Result<Self> {
        thread::scope(|scope| {
            let all_handle =
                scope.spawn(|| CohortDataset::import(parent_path, None, AddressSplit::All));

            let plankton_handle = scope.spawn(|| {
                CohortDataset::import(
                    parent_path,
                    Some("plankton"),
                    AddressSplit::Size(AddressSize::Plankton),
                )
            });
            let shrimp_handle = scope.spawn(|| {
                CohortDataset::import(
                    parent_path,
                    Some("shrimp"),
                    AddressSplit::Size(AddressSize::Shrimp),
                )
            });
            let crab_handle = scope.spawn(|| {
                CohortDataset::import(
                    parent_path,
                    Some("crab"),
                    AddressSplit::Size(AddressSize::Crab),
                )
            });
            let fish_handle = scope.spawn(|| {
                CohortDataset::import(
                    parent_path,
                    Some("fish"),
                    AddressSplit::Size(AddressSize::Fish),
                )
            });
            let shark_handle = scope.spawn(|| {
                CohortDataset::import(
                    parent_path,
                    Some("shark"),
                    AddressSplit::Size(AddressSize::Shark),
                )
            });
            let whale_handle = scope.spawn(|| {
                CohortDataset::import(
                    parent_path,
                    Some("whale"),
                    AddressSplit::Size(AddressSize::Whale),
                )
            });
            let humpback_handle = scope.spawn(|| {
                CohortDataset::import(
                    parent_path,
                    Some("humpback"),
                    AddressSplit::Size(AddressSize::Humpback),
                )
            });
            let megalodon_handle = scope.spawn(|| {
                CohortDataset::import(
                    parent_path,
                    Some("megalodon"),
                    AddressSplit::Size(AddressSize::Megalodon),
                )
            });

            let p2pk_handle = scope.spawn(|| {
                CohortDataset::import(
                    parent_path,
                    Some("p2pk"),
                    AddressSplit::Type(AddressType::P2PK),
                )
            });
            let p2pkh_handle = scope.spawn(|| {
                CohortDataset::import(
                    parent_path,
                    Some("p2pkh"),
                    AddressSplit::Type(AddressType::P2PKH),
                )
            });
            let p2sh_handle = scope.spawn(|| {
                CohortDataset::import(
                    parent_path,
                    Some("p2sh"),
                    AddressSplit::Type(AddressType::P2SH),
                )
            });
            let p2wpkh_handle = scope.spawn(|| {
                CohortDataset::import(
                    parent_path,
                    Some("p2wpkh"),
                    AddressSplit::Type(AddressType::P2WPKH),
                )
            });
            let p2wsh_handle = scope.spawn(|| {
                CohortDataset::import(
                    parent_path,
                    Some("p2wsh"),
                    AddressSplit::Type(AddressType::P2WSH),
                )
            });

            let p2tr = CohortDataset::import(
                parent_path,
                Some("p2tr"),
                AddressSplit::Type(AddressType::P2TR),
            )?;

            let mut s = Self {
                min_initial_states: MinInitialStates::default(),

                metadata: AllAddressesMetadataDataset::import(parent_path)?,

                cohorts: SplitByAddressCohort {
                    all: all_handle.join().unwrap()?,

                    plankton: plankton_handle.join().unwrap()?,
                    shrimp: shrimp_handle.join().unwrap()?,
                    crab: crab_handle.join().unwrap()?,
                    fish: fish_handle.join().unwrap()?,
                    shark: shark_handle.join().unwrap()?,
                    whale: whale_handle.join().unwrap()?,
                    humpback: humpback_handle.join().unwrap()?,
                    megalodon: megalodon_handle.join().unwrap()?,

                    p2pk: p2pk_handle.join().unwrap()?,
                    p2pkh: p2pkh_handle.join().unwrap()?,
                    p2sh: p2sh_handle.join().unwrap()?,
                    p2wpkh: p2wpkh_handle.join().unwrap()?,
                    p2wsh: p2wsh_handle.join().unwrap()?,
                    p2tr,
                },
            };

            s.min_initial_states
                .consume(MinInitialStates::compute_from_datasets(&s));

            Ok(s)
        })
    }

    pub fn insert(&mut self, insert_data: &InsertData) {
        self.metadata.insert(insert_data);

        // self.all.insert(insert_data);

        // self.plankton.insert(insert_data);
        // self.shrimp.insert(insert_data);
        // self.crab.insert(insert_data);
        // self.fish.insert(insert_data);
        // self.shark.insert(insert_data);
        // self.whale.insert(insert_data);
        // self.humpback.insert(insert_data);
        // self.megalodon.insert(insert_data);

        // self.p2pk.insert(insert_data);
        // self.p2pkh.insert(insert_data);
        // self.p2sh.insert(insert_data);
        // self.p2wpkh.insert(insert_data);
        // self.p2wsh.insert(insert_data);
        // self.p2tr.insert(insert_data);
        //
        self.cohorts
            .as_mut_vec()
            .into_iter()
            .for_each(|cohort| cohort.insert(insert_data))
    }

    pub fn compute(
        &mut self,
        compute_data: &ComputeData,
        date_closes: &mut DateMap<f32>,
        height_closes: &mut HeightMap<f32>,
    ) {
        self.metadata.compute(compute_data);

        // self.all.compute(compute_data, date_closes, height_closes);

        // self.plankton
        //     .compute(compute_data, date_closes, height_closes);
        // self.shrimp
        //     .compute(compute_data, date_closes, height_closes);
        // self.crab.compute(compute_data, date_closes, height_closes);
        // self.fish.compute(compute_data, date_closes, height_closes);
        // self.shark.compute(compute_data, date_closes, height_closes);
        // self.whale.compute(compute_data, date_closes, height_closes);
        // self.humpback
        //     .compute(compute_data, date_closes, height_closes);
        // self.megalodon
        //     .compute(compute_data, date_closes, height_closes);

        // self.p2pk.compute(compute_data, date_closes, height_closes);
        // self.p2pkh.compute(compute_data, date_closes, height_closes);
        // self.p2sh.compute(compute_data, date_closes, height_closes);
        // self.p2wpkh
        //     .compute(compute_data, date_closes, height_closes);
        // self.p2wsh.compute(compute_data, date_closes, height_closes);
        // self.p2tr.compute(compute_data, date_closes, height_closes);
        //
        self.cohorts
            .as_mut_vec()
            .into_iter()
            .for_each(|cohort| cohort.compute(compute_data, date_closes, height_closes))
    }
}

impl AnyDatasets for AddressDatasets {
    fn get_min_initial_states(&self) -> &MinInitialStates {
        &self.min_initial_states
    }

    fn to_any_dataset_vec(&self) -> Vec<&(dyn AnyDataset + Send + Sync)> {
        self.cohorts
            .as_vec()
            .into_iter()
            .map(|d| d as &(dyn AnyDataset + Send + Sync))
            .chain(vec![&self.metadata as &(dyn AnyDataset + Send + Sync)])
            .collect_vec()
    }

    fn to_mut_any_dataset_vec(&mut self) -> Vec<&mut dyn AnyDataset> {
        self.cohorts
            .as_mut_vec()
            .into_iter()
            .map(|d| d as &mut dyn AnyDataset)
            .chain(vec![&mut self.metadata as &mut dyn AnyDataset])
            .collect_vec()
    }
}
