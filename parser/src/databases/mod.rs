use std::thread;

use chrono::NaiveDate;

mod _database;
mod _trait;
// mod address_index_to_address_data;
mod address_index_to_empty_address_data;
mod address_to_address_index;
mod metadata;
// mod tx_index_to_tx_data;
mod txid_to_tx_index;
// mod txout_index_to_address_index;
// mod txout_index_to_sats;

pub use _database::*;
use _trait::*;
// pub use address_index_to_address_data::*;
pub use address_index_to_empty_address_data::*;
pub use address_to_address_index::*;
use metadata::*;
// pub use tx_index_to_tx_data::*;
pub use txid_to_tx_index::*;
// pub use txout_index_to_address_index::*;
// pub use txout_index_to_sats::*;

use crate::{structs::WNaiveDate, utils::time};

pub struct Databases {
    // pub address_index_to_address_data: AddressIndexToAddressData,
    pub address_index_to_empty_address_data: AddressIndexToEmptyAddressData,
    pub address_to_address_index: AddressToAddressIndex,
    // pub tx_index_to_tx_data: TxIndexToTxData,
    pub txid_to_tx_index: TxidToTxIndex,
    // pub txout_index_to_address_index: TxoutIndexToAddressIndex,
    // pub txout_index_to_sats: TxoutIndexToSats,
}

impl Databases {
    pub fn import() -> Self {
        // let address_index_to_address_data = AddressIndexToAddressData::import();

        let address_index_to_empty_address_data = AddressIndexToEmptyAddressData::import();

        let address_to_address_index = AddressToAddressIndex::import();

        // let tx_index_to_tx_data = TxIndexToTxData::import();

        let txid_to_tx_index = TxidToTxIndex::import();

        // let txout_index_to_address_index = TxoutIndexToAddressIndex::import();

        // let txout_index_to_sats = TxoutIndexToSats::import();

        Self {
            // address_index_to_address_data,
            address_index_to_empty_address_data,
            address_to_address_index,
            // tx_index_to_tx_data,
            txid_to_tx_index,
            // txout_index_to_address_index,
            // txout_index_to_sats,
        }
    }

    pub fn export(&mut self, height: usize, date: NaiveDate) -> color_eyre::Result<()> {
        thread::scope(|s| {
            // s.spawn(|| {
            //     time("  Database address_index_to_address_data", || {
            //         self.address_index_to_address_data.export(height, date)
            //     })
            // });
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
            // s.spawn(|| {
            //     time("  Database tx_index_to_tx_data", || {
            //         self.tx_index_to_tx_data.export(height, date)
            //     })
            // });
            s.spawn(|| {
                time("  Database txid_to_tx_index", || {
                    self.txid_to_tx_index.export(height, date)
                })
            });
            // s.spawn(|| {
            //     time("  Database txout_index_to_address_index", || {
            //         self.txout_index_to_address_index.export(height, date)
            //     })
            // });
            // s.spawn(|| {
            //     time("  Database txout_index_to_sats", || {
            //         self.txout_index_to_sats.export(height, date)
            //     })
            // });
        });

        Ok(())
    }

    pub fn reset(&mut self, include_addresses: bool) {
        if include_addresses {
            // let _ = self.address_index_to_address_data.reset();
            let _ = self.address_index_to_empty_address_data.reset();
            let _ = self.address_to_address_index.reset();
            // let _ = self.txout_index_to_address_index.reset();
        }

        // let _ = self.tx_index_to_tx_data.reset();
        let _ = self.txid_to_tx_index.reset();
        // let _ = self.txout_index_to_sats.reset();
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

        // We only need to check one as we previously checked that they're all in sync
        check_metadata(&self.address_to_address_index.metadata)
    }

    pub fn check_if_usable(
        &self,
        min_initial_last_address_height: Option<usize>,
        min_initial_last_address_date: Option<NaiveDate>,
    ) -> bool {
        // let are_tx_databases_in_sync = self
        //     .tx_index_to_tx_data
        //     .metadata
        //     .check_if_in_sync(&self.txid_to_tx_index.metadata)
        //     && self
        //         .tx_index_to_tx_data
        //         .metadata
        //         .check_if_in_sync(&self.txout_index_to_sats.metadata);

        // if !are_tx_databases_in_sync {
        //     return false;
        // }

        let are_address_databases_in_sync = self
            .address_to_address_index
            .metadata
            .check_if_in_sync(&self.address_index_to_empty_address_data.metadata);
        // && self
        //     .address_to_address_index
        //     .metadata
        //     .check_if_in_sync(&self.address_index_to_address_data.metadata)
        // && self
        //     .address_to_address_index
        //     .metadata
        //     .check_if_in_sync(&self.txout_index_to_address_index.metadata);

        if !are_address_databases_in_sync {
            return false;
        }

        let are_address_databases_farer_or_in_sync_with_tx_database = self
            .address_to_address_index
            .metadata
            .check_farer_or_in_sync(&self.txid_to_tx_index.metadata);

        if !are_address_databases_farer_or_in_sync_with_tx_database {
            return false;
        }

        // let are_address_datasets_farer_or_in_sync_with_address_databases =
        min_initial_last_address_height >= self.address_to_address_index.metadata.last_height
            && min_initial_last_address_date
                >= self.address_to_address_index.metadata.last_date.map(|d| *d)
    }
}
