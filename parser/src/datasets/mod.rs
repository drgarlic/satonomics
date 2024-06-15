use std::{collections::BTreeMap, ops::RangeInclusive};

use allocative::Allocative;

use itertools::Itertools;

use rayon::prelude::*;

mod _traits;
mod address;
mod block_metadata;
mod coindays;
mod cointime;
mod constant;
mod date_metadata;
mod mining;
mod price;
mod subs;
mod transaction;
mod utxo;

pub use _traits::*;
pub use address::*;
pub use block_metadata::*;
pub use coindays::*;
pub use cointime::*;
pub use constant::*;
pub use date_metadata::*;
pub use mining::*;
pub use price::*;
pub use subs::*;
pub use transaction::*;
pub use utxo::*;

use crate::{
    databases::Databases,
    io::Json,
    states::{
        AddressCohortsInputStates,
        AddressCohortsOneShotStates,
        AddressCohortsRealizedStates,
        States,
        UTXOCohortsOneShotStates,
        // UTXOCohortsReceivedStates,
        UTXOCohortsSentStates,
    },
    structs::{Price, WAmount, WNaiveDate},
};

pub struct InsertData<'a> {
    pub address_cohorts_input_states: &'a Option<AddressCohortsInputStates>,
    pub address_cohorts_one_shot_states: &'a Option<AddressCohortsOneShotStates>,
    pub address_cohorts_realized_states: &'a Option<AddressCohortsRealizedStates>,
    pub amount_sent: WAmount,
    pub block_interval: u32,
    pub block_price: Price,
    pub block_size: usize,
    pub block_vbytes: u64,
    pub block_weight: u64,
    pub coinbase: WAmount,
    pub compute_addresses: bool,
    pub databases: &'a Databases,
    pub date: WNaiveDate,
    pub date_blocks_range: &'a RangeInclusive<usize>,
    pub date_first_height: usize,
    pub difficulty: f64,
    pub fees: &'a Vec<WAmount>,
    pub height: usize,
    pub is_date_last_block: bool,
    pub satblocks_destroyed: WAmount,
    pub satdays_destroyed: WAmount,
    pub states: &'a States,
    pub timestamp: u32,
    pub transaction_count: usize,
    pub utxo_cohorts_one_shot_states: &'a UTXOCohortsOneShotStates,
    // pub utxo_cohorts_received_states: &'a UTXOCohortsReceivedStates,
    pub utxo_cohorts_sent_states: &'a UTXOCohortsSentStates,
}

pub struct ComputeData<'a> {
    pub heights: &'a [usize],
    pub dates: &'a [WNaiveDate],
}

#[derive(Allocative)]
pub struct AllDatasets {
    min_initial_states: MinInitialStates,

    pub constant: ConstantDataset,
    pub address: AddressDatasets,
    pub block_metadata: BlockMetadataDataset,
    pub coindays: CoindaysDataset,
    pub cointime: CointimeDataset,
    pub date_metadata: DateMetadataDataset,
    pub mining: MiningDataset,
    pub price: PriceDatasets,
    pub transaction: TransactionDataset,
    pub utxo: UTXODatasets,
}

impl AllDatasets {
    pub fn import() -> color_eyre::Result<Self> {
        let path = "../datasets";

        let price = PriceDatasets::import(path)?;

        let constant = ConstantDataset::import(path)?;

        let date_metadata = DateMetadataDataset::import(path)?;

        let cointime = CointimeDataset::import(path)?;

        let coindays = CoindaysDataset::import(path)?;

        let mining = MiningDataset::import(path)?;

        let block_metadata = BlockMetadataDataset::import(path)?;

        let transaction = TransactionDataset::import(path)?;

        let address = AddressDatasets::import(path)?;

        let utxo = UTXODatasets::import(path)?;

        let mut s = Self {
            min_initial_states: MinInitialStates::default(),

            address,
            block_metadata,
            cointime,
            coindays,
            constant,
            date_metadata,
            price,
            mining,
            transaction,
            utxo,
        };

        s.min_initial_states
            .consume(MinInitialStates::compute_from_datasets(&s));

        s.export_path_to_type()?;

        Ok(s)
    }

    pub fn insert(&mut self, insert_data: InsertData) {
        self.address.insert(&insert_data);

        self.utxo.insert(&insert_data);

        if self.block_metadata.should_insert(&insert_data) {
            self.block_metadata.insert(&insert_data);
        }

        if self.date_metadata.should_insert(&insert_data) {
            self.date_metadata.insert(&insert_data);
        }

        if self.coindays.should_insert(&insert_data) {
            self.coindays.insert(&insert_data);
        }

        if self.mining.should_insert(&insert_data) {
            self.mining.insert(&insert_data);
        }

        if self.transaction.should_insert(&insert_data) {
            self.transaction.insert(&insert_data);
        }

        if self.cointime.should_insert(&insert_data) {
            self.cointime.insert(&insert_data);
        }
    }

    pub fn compute(&mut self, compute_data: ComputeData) {
        if self.constant.should_compute(&compute_data) {
            self.constant.compute(&compute_data);
        }

        if self.mining.should_compute(&compute_data) {
            self.mining
                .compute(&compute_data, &mut self.date_metadata.last_height);
        }

        // No compute needed for now
        self.price
            .compute(&compute_data, &mut self.mining.cumulative_subsidy);

        self.address.compute(
            &compute_data,
            &mut self.price.closes,
            &mut self.mining.cumulative_subsidy,
            &mut self.price.market_cap,
        );

        self.utxo.compute(
            &compute_data,
            &mut self.price.closes,
            &mut self.mining.cumulative_subsidy,
            &mut self.price.market_cap,
        );

        // No compute needed for now
        // if self.block_metadata.should_compute(height, date) {
        //     self.block_metadata.compute(&compute_data);
        // }

        // No compute needed for now
        // if self.date_metadata.should_compute(height, date) {
        //     self.date_metadata.compute(&compute_data);
        // }

        // No compute needed for now
        // if self.coindays.should_compute(height, date) {
        //     self.coindays.compute(&compute_data);
        // }

        if self.transaction.should_compute(&compute_data) {
            self.transaction.compute(
                &compute_data,
                &mut self.mining.cumulative_subsidy,
                &mut self.mining.block_interval,
            );
        }

        if self.cointime.should_compute(&compute_data) {
            self.cointime.compute(
                &compute_data,
                &mut self.date_metadata.first_height,
                &mut self.date_metadata.last_height,
                &mut self.price.closes,
                &mut self.mining.cumulative_subsidy,
                &mut self.address.cohorts.all.all.capitalization.realized_cap,
                &mut self.address.cohorts.all.all.capitalization.realized_price,
                &mut self.mining.yearly_inflation_rate,
                &mut self.transaction.annualized_volume,
                &mut self.mining.cumulative_subsidy_in_dollars,
            );
        }
    }

    pub fn export_path_to_type(&self) -> color_eyre::Result<()> {
        let path_to_type: BTreeMap<&str, &str> = self
            .to_any_dataset_vec()
            .into_iter()
            .flat_map(|dataset| {
                dataset
                    .to_all_map_vec()
                    .into_iter()
                    .flat_map(|map| map.exported_path_with_t_name())
            })
            .collect();

        Json::export("../datasets/disk_path_to_type.json", &path_to_type)
    }

    pub fn export(&mut self) -> color_eyre::Result<()> {
        self.to_mut_any_dataset_vec()
            .into_iter()
            .for_each(|dataset| dataset.pre_export());

        self.to_any_dataset_vec()
            .into_par_iter()
            .try_for_each(|dataset| -> color_eyre::Result<()> { dataset.export() })?;

        self.to_mut_any_dataset_vec()
            .into_iter()
            .for_each(|dataset| dataset.post_export());

        Ok(())
    }
}

impl AnyDatasets for AllDatasets {
    fn get_min_initial_states(&self) -> &MinInitialStates {
        &self.min_initial_states
    }

    fn to_any_dataset_vec(&self) -> Vec<&(dyn AnyDataset + Send + Sync)> {
        vec![
            vec![
                &self.price as &(dyn AnyDataset + Send + Sync),
                &self.constant,
            ],
            self.address.to_any_dataset_vec(),
            self.utxo.to_any_dataset_vec(),
            vec![
                &self.mining,
                &self.transaction,
                &self.block_metadata,
                &self.date_metadata,
                &self.cointime,
                &self.coindays,
            ],
        ]
        .into_iter()
        .flatten()
        .collect_vec()
    }

    fn to_mut_any_dataset_vec(&mut self) -> Vec<&mut dyn AnyDataset> {
        vec![
            vec![&mut self.price as &mut dyn AnyDataset, &mut self.constant],
            self.address.to_mut_any_dataset_vec(),
            self.utxo.to_mut_any_dataset_vec(),
            vec![
                &mut self.mining,
                &mut self.transaction,
                &mut self.block_metadata,
                &mut self.date_metadata,
                &mut self.cointime,
                &mut self.coindays,
            ],
        ]
        .into_iter()
        .flatten()
        .collect_vec()
    }
}
