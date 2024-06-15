use allocative::Allocative;
use derive_deref::{Deref, DerefMut};
use rayon::prelude::*;

use crate::{
    actions::SentData,
    states::DateDataVec,
    structs::{BlockData, WAmount},
    utils::{difference_in_days_between_timestamps, timestamp_to_year},
};

use super::{SplitByUTXOCohort, UTXOCohortDurableStates, UTXOCohortsOneShotStates};

#[derive(Default, Deref, DerefMut, Allocative)]
pub struct UTXOCohortsDurableStates(SplitByUTXOCohort<UTXOCohortDurableStates>);

impl UTXOCohortsDurableStates {
    pub fn init(date_data_vec: &DateDataVec) -> Self {
        let mut s = Self::default();

        if let Some(last_date_data) = date_data_vec.last() {
            let last_block_data = last_date_data.blocks.last().unwrap();

            date_data_vec
                .iter()
                .flat_map(|date_data| &date_data.blocks)
                .for_each(|block_data| {
                    let amount = block_data.amount;
                    let utxo_count = block_data.spendable_outputs as usize;

                    // No need to either insert or remove if 0
                    if amount == WAmount::ZERO {
                        return;
                    }

                    let increment_days_old = difference_in_days_between_timestamps(
                        block_data.timestamp,
                        last_block_data.timestamp,
                    );

                    let block_data_year = timestamp_to_year(block_data.timestamp);

                    s.initial_filtered_apply(&increment_days_old, &block_data_year, |state| {
                        state
                            .increment(amount, utxo_count, block_data.price)
                            .unwrap();
                    });
                });
        }

        s
    }

    pub fn udpate_age_if_needed(
        &mut self,
        block_data: &BlockData,
        last_block_data: &BlockData,
        previous_last_block_data: Option<&BlockData>,
    ) {
        let amount = block_data.amount;
        let utxo_count = block_data.spendable_outputs as usize;

        // No need to either insert or remove if 0
        if amount == WAmount::ZERO {
            return;
        }

        let increment_days_old =
            difference_in_days_between_timestamps(block_data.timestamp, last_block_data.timestamp);

        let block_data_year = timestamp_to_year(block_data.timestamp);

        if block_data.height == last_block_data.height {
            self.initial_filtered_apply(&increment_days_old, &block_data_year, |state| {
                state
                    .increment(amount, utxo_count, block_data.price)
                    .unwrap();
            })
        } else {
            let previous_last_block_data = previous_last_block_data.unwrap_or_else(|| {
                dbg!(block_data, last_block_data, previous_last_block_data);
                panic!()
            });

            // if block_data.has_lower_or_equal_timestamp(previous_last_block_data) {
            let decrement_days_old = difference_in_days_between_timestamps(
                block_data.timestamp,
                previous_last_block_data.timestamp,
            );

            if increment_days_old == decrement_days_old {
                return;
            }

            self.duo_filtered_apply(
                &increment_days_old,
                &decrement_days_old,
                |state| {
                    state
                        .increment(amount, utxo_count, block_data.price)
                        .unwrap();
                },
                |state| {
                    state
                        .decrement(amount, utxo_count, block_data.price)
                        .unwrap();
                },
            );
        }
    }

    pub fn subtract_moved(
        &mut self,
        block_data: &BlockData,
        sent_data: &SentData,
        previous_last_block_data: &BlockData,
    ) {
        let amount = sent_data.volume;
        let utxo_count = sent_data.count as usize;

        // No need to either insert or remove if 0
        if amount == WAmount::ZERO {
            return;
        }

        let days_old = difference_in_days_between_timestamps(
            block_data.timestamp,
            previous_last_block_data.timestamp,
        );

        let block_data_year = timestamp_to_year(block_data.timestamp);

        self.initial_filtered_apply(&days_old, &block_data_year, |state| {
            state
                .decrement(amount, utxo_count, block_data.price)
                .unwrap();
        })
    }

    pub fn compute_one_shot_states(
        &mut self,
        block_price: f32,
        date_price: Option<f32>,
    ) -> UTXOCohortsOneShotStates {
        let mut one_shot_states = UTXOCohortsOneShotStates::default();

        self.as_vec()
            .into_par_iter()
            .map(|(states, id)| (states.compute_one_shot_states(block_price, date_price), id))
            .collect::<Vec<_>>()
            .into_iter()
            .for_each(|(states, id)| {
                *one_shot_states.get_mut(&id) = states;
            });

        one_shot_states
    }
}
