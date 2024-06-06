use derive_deref::{Deref, DerefMut};
use rayon::prelude::*;

use crate::{
    states::AddressIndexToAddressData,
    structs::{AddressData, AddressRealizedData},
    utils::convert_cents_to_significant_cents,
};

use super::{AddressCohortDurableStates, AddressCohortsOneShotStates, SplitByAddressCohort};

#[derive(Default, Deref, DerefMut)]
pub struct AddressCohortsDurableStates(SplitByAddressCohort<AddressCohortDurableStates>);

impl AddressCohortsDurableStates {
    pub fn init(address_index_to_address_data: &AddressIndexToAddressData) -> Self {
        let mut s = Self::default();

        address_index_to_address_data
            .iter()
            .for_each(|(_, address_data)| s.increment(address_data));

        s
    }

    pub fn iterate(
        &mut self,
        address_realized_data: &AddressRealizedData,
        current_address_data: &AddressData,
    ) {
        self.decrement(&address_realized_data.initial_address_data);
        self.increment(current_address_data);
    }

    /// Should always increment using current address data state
    fn increment(&mut self, address_data: &AddressData) {
        self._crement(address_data, true)
    }

    /// Should always decrement using initial address data state
    fn decrement(&mut self, address_data: &AddressData) {
        self._crement(address_data, false)
    }

    fn _crement(&mut self, address_data: &AddressData, increment: bool) {
        // No need to either insert or remove if empty
        if address_data.is_empty() {
            return;
        }

        let amount = *address_data.amount;
        let utxo_count = address_data.outputs_len as usize;

        let mean_cents_paid = convert_cents_to_significant_cents(address_data.mean_cents_paid);

        let liquidity_classification = address_data.compute_liquidity_classification();

        let split_sat_amount = liquidity_classification.split(amount.to_sat() as f64);
        let split_utxo_count = liquidity_classification.split(utxo_count as f64);

        self.0
            .iterate(address_data, |state: &mut AddressCohortDurableStates| {
                if increment {
                    state.increment(
                        amount,
                        utxo_count,
                        mean_cents_paid,
                        &split_sat_amount,
                        &split_utxo_count,
                    );
                } else {
                    state.decrement(
                        amount,
                        utxo_count,
                        mean_cents_paid,
                        &split_sat_amount,
                        &split_utxo_count,
                    )
                }
            });
    }

    pub fn compute_one_shot_states(
        &mut self,
        block_price: f32,
        date_price: Option<f32>,
    ) -> AddressCohortsOneShotStates {
        let mut one_shot_states = AddressCohortsOneShotStates::default();

        self.as_vec()
            .into_par_iter()
            .flat_map(|(states, address_cohort_id)| {
                states
                    .split
                    .as_vec()
                    .into_par_iter()
                    .map(move |(states, liquidity_id)| {
                        (
                            address_cohort_id,
                            liquidity_id,
                            states.compute_one_shot_states(block_price, date_price),
                        )
                    })
            })
            .map(|(address_cohort_id, liquidity_id, states)| {
                (address_cohort_id, liquidity_id, states)
            })
            .collect::<Vec<_>>()
            .into_iter()
            .for_each(|(address_cohort_id, liquidity_id, states)| {
                *one_shot_states
                    .get_mut_from_id(&address_cohort_id)
                    .get_mut(&liquidity_id) = states;
            });

        one_shot_states
    }
}
