use std::thread;

mod _trait;
mod cohorts_states;
mod counters;
mod date_data_vec;

pub use _trait::*;
pub use cohorts_states::*;
use counters::*;
use date_data_vec::*;

use crate::{databases::AddressIndexToAddressData, utils::log};

#[derive(Default)]
pub struct States {
    pub address_counters: Counters,
    pub date_data_vec: DateDataVec,
    pub address_cohorts_durable_states: AddressCohortsDurableStates,
    pub utxo_cohorts_durable_states: UTXOCohortsDurableStates,
}

impl States {
    pub fn import(
        address_index_to_address_data: &mut AddressIndexToAddressData,
    ) -> color_eyre::Result<Self> {
        let date_data_vec_handle = thread::spawn(DateDataVec::import);

        let address_counters = Counters::import()?;

        let date_data_vec = date_data_vec_handle.join().unwrap()?;

        let address_cohorts_durable_states =
            AddressCohortsDurableStates::init(address_index_to_address_data);

        let utxo_cohorts_durable_states = UTXOCohortsDurableStates::init(&date_data_vec);

        Ok(Self {
            address_cohorts_durable_states,
            address_counters,
            date_data_vec,
            utxo_cohorts_durable_states,
        })
    }

    pub fn reset(&mut self, include_addresses: bool) {
        log("Reseting all states...");

        let _ = self.date_data_vec.reset();

        self.utxo_cohorts_durable_states = UTXOCohortsDurableStates::default();

        // TODO: Check that they are ONLY computed in an `if include_addresses`
        if include_addresses {
            let _ = self.address_counters.reset();

            self.address_cohorts_durable_states = AddressCohortsDurableStates::default();
        }
    }

    pub fn export(&self) -> color_eyre::Result<()> {
        thread::scope(|s| {
            s.spawn(|| self.address_counters.export().unwrap());
            s.spawn(|| self.date_data_vec.export().unwrap());
        });

        Ok(())
    }
}
