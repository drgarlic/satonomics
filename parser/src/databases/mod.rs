mod _trait;
mod address_index_to_empty_address_data;
mod address_to_address_index;
mod metadata;
mod txid_to_tx_index;

use std::thread;

use _trait::*;
pub use address_index_to_empty_address_data::*;
pub use address_to_address_index::*;
use chrono::NaiveDate;
use metadata::*;
pub use txid_to_tx_index::*;

use crate::{parse::WNaiveDate, utils::time};

pub struct Databases {
    pub address_index_to_empty_address_data: AddressIndexToEmptyAddressData,
    pub address_to_address_index: AddressToAddressIndex,
    pub txid_to_tx_index: TxidToTxIndex,
}

impl Databases {
    pub fn import() -> Self {
        let address_index_to_empty_address_data = AddressIndexToEmptyAddressData::import();

        let address_to_address_index = AddressToAddressIndex::import();

        let txid_to_tx_index = TxidToTxIndex::import();

        Self {
            address_index_to_empty_address_data,
            address_to_address_index,
            txid_to_tx_index,
        }
    }

    pub fn export(&mut self, height: usize, date: NaiveDate) -> color_eyre::Result<()> {
        thread::scope(|s| {
            s.spawn(|| {
                time("  Database address_index_to_empty_address_data", || {
                    self.address_index_to_empty_address_data
                        .export(height, date)
                })
            });
            s.spawn(|| {
                time("  Database address_to_address_index", || {
                    self.address_to_address_index.export(height, date)
                })
            });
            s.spawn(|| {
                time("  Database txid_to_tx_index", || {
                    self.txid_to_tx_index.export(height, date)
                })
            });
        });

        Ok(())
    }

    pub fn reset(&mut self, include_addresses: bool) {
        if include_addresses {
            let _ = self.address_index_to_empty_address_data.reset();
            let _ = self.address_to_address_index.reset();
        }

        let _ = self.txid_to_tx_index.reset();
    }

    pub fn check_if_needs_to_compute_addresses(&self, height: usize, date: NaiveDate) -> bool {
        let check_height = |last_height: Option<usize>| {
            last_height.map_or(true, |last_height| last_height < height)
        };

        let check_date =
            |last_date: Option<WNaiveDate>| last_date.map_or(true, |last_date| *last_date < date);

        let check_metadata = |metadata: &Metadata| {
            check_height(metadata.last_height) || check_date(metadata.last_date)
        };

        check_metadata(&self.address_index_to_empty_address_data.metadata)
            || check_metadata(&self.address_to_address_index.metadata)
    }

    pub fn check_if_usable(
        &self,
        min_initial_last_address_height: Option<usize>,
        min_initial_last_address_date: Option<NaiveDate>,
    ) -> bool {
        let are_address_databases_in_sync =
            self.address_index_to_empty_address_data.metadata.last_date
                == self.address_to_address_index.metadata.last_date
                && self
                    .address_index_to_empty_address_data
                    .metadata
                    .last_height
                    == self.address_to_address_index.metadata.last_height;

        let are_address_databases_farer_or_in_sync_with_tx_database =
            self.address_to_address_index.metadata.last_date
                >= self.txid_to_tx_index.metadata.last_date
                && self.address_to_address_index.metadata.last_height
                    >= self.txid_to_tx_index.metadata.last_height;

        let are_address_datasets_farer_or_in_sync_with_address_databases =
            min_initial_last_address_height >= self.address_to_address_index.metadata.last_height
                && min_initial_last_address_date
                    >= self.address_to_address_index.metadata.last_date.map(|d| *d);

        are_address_databases_in_sync
            && are_address_databases_farer_or_in_sync_with_tx_database
            && are_address_datasets_farer_or_in_sync_with_address_databases
    }
}
