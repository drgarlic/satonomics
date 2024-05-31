use std::thread;

use bitcoin::Amount;
use derive_deref::{Deref, DerefMut};

use crate::{
    actions::SentData,
    states::{DateDataVec, DurableStates},
    structs::BlockData,
    utils::{
        convert_price_to_significant_cents, difference_in_days_between_timestamps,
        timestamp_to_year,
    },
};

use super::{SplitByUTXOCohort, UTXOCohortsOneShotStates};

#[derive(Default, Deref, DerefMut)]
pub struct UTXOCohortsDurableStates(SplitByUTXOCohort<DurableStates>);

impl UTXOCohortsDurableStates {
    pub fn init(date_data_vec: &DateDataVec) -> Self {
        let mut s = Self::default();

        if let Some(last_date_data) = date_data_vec.last() {
            let last_block_data = last_date_data.blocks.last().unwrap();

            date_data_vec
                .iter()
                .flat_map(|date_data| &date_data.blocks)
                .for_each(|block_data| {
                    let amount = *block_data.amount;
                    let utxo_count = block_data.spendable_outputs as usize;

                    // No need to either insert or remove if 0
                    if amount == Amount::ZERO {
                        return;
                    }

                    let price_in_cents = convert_price_to_significant_cents(block_data.price);

                    let increment_days_old = difference_in_days_between_timestamps(
                        block_data.timestamp,
                        last_block_data.timestamp,
                    );

                    let block_data_year = timestamp_to_year(block_data.timestamp);

                    s.initial_filtered_apply(&increment_days_old, &block_data_year, |state| {
                        state.increment(amount, utxo_count, price_in_cents);
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
        let amount = *block_data.amount;
        let utxo_count = block_data.spendable_outputs as usize;

        // No need to either insert or remove if 0
        if amount == Amount::ZERO {
            return;
        }

        let price_in_cents = convert_price_to_significant_cents(block_data.price);

        let increment_days_old =
            difference_in_days_between_timestamps(block_data.timestamp, last_block_data.timestamp);

        let block_data_year = timestamp_to_year(block_data.timestamp);

        if block_data.height == last_block_data.height {
            self.initial_filtered_apply(&increment_days_old, &block_data_year, |state| {
                state.increment(amount, utxo_count, price_in_cents);
            })
        } else {
            let previous_last_block_data = previous_last_block_data.unwrap_or_else(|| {
                dbg!(block_data, last_block_data, previous_last_block_data);
                panic!()
            });

            // let re_org = last_block_data.has_lower_or_equal_timestamp(previous_last_block_data);

            // if re_org {
            //     return;
            // }

            // if block_data.has_lower_or_equal_timestamp(previous_last_block_data) {
            let decrement_days_old = difference_in_days_between_timestamps(
                block_data.timestamp,
                previous_last_block_data.timestamp,
            );

            if increment_days_old == decrement_days_old {
                return;
            }

            // dbg!(
            //     block_data.timestamp,
            //     last_block_data.timestamp,
            //     previous_last_block_data.timestamp
            // );

            self.duo_filtered_apply(
                &increment_days_old,
                &decrement_days_old,
                |state| {
                    state.increment(amount, utxo_count, price_in_cents);
                },
                |state| {
                    state.decrement(amount, utxo_count, price_in_cents);
                },
            );
            // }
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
        if amount == Amount::ZERO {
            return;
        }

        let price_in_cents = convert_price_to_significant_cents(block_data.price);

        let days_old = difference_in_days_between_timestamps(
            block_data.timestamp,
            previous_last_block_data.timestamp,
        );

        let block_data_year = timestamp_to_year(block_data.timestamp);

        self.initial_filtered_apply(&days_old, &block_data_year, |state| {
            state.decrement(amount, utxo_count, price_in_cents);
        })
    }

    pub fn compute_one_shot_states(
        &mut self,
        block_price: f32,
        date_price: Option<f32>,
    ) -> UTXOCohortsOneShotStates {
        thread::scope(|scope| {
            let sth_handle =
                scope.spawn(|| self.sth.compute_one_shot_states(block_price, date_price));
            let lth_handle =
                scope.spawn(|| self.lth.compute_one_shot_states(block_price, date_price));

            let up_to_1d_handle = scope.spawn(|| {
                self.up_to_1d
                    .compute_one_shot_states(block_price, date_price)
            });
            let up_to_1w_handle = scope.spawn(|| {
                self.up_to_1w
                    .compute_one_shot_states(block_price, date_price)
            });
            let up_to_1m_handle = scope.spawn(|| {
                self.up_to_1m
                    .compute_one_shot_states(block_price, date_price)
            });
            let up_to_2m_handle = scope.spawn(|| {
                self.up_to_2m
                    .compute_one_shot_states(block_price, date_price)
            });
            let up_to_3m_handle = scope.spawn(|| {
                self.up_to_3m
                    .compute_one_shot_states(block_price, date_price)
            });
            let up_to_4m_handle = scope.spawn(|| {
                self.up_to_4m
                    .compute_one_shot_states(block_price, date_price)
            });
            let up_to_5m_handle = scope.spawn(|| {
                self.up_to_5m
                    .compute_one_shot_states(block_price, date_price)
            });
            let up_to_6m_handle = scope.spawn(|| {
                self.up_to_6m
                    .compute_one_shot_states(block_price, date_price)
            });
            let up_to_1y_handle = scope.spawn(|| {
                self.up_to_1y
                    .compute_one_shot_states(block_price, date_price)
            });
            let up_to_2y_handle = scope.spawn(|| {
                self.up_to_2y
                    .compute_one_shot_states(block_price, date_price)
            });
            let up_to_3y_handle = scope.spawn(|| {
                self.up_to_3y
                    .compute_one_shot_states(block_price, date_price)
            });
            let up_to_5y_handle = scope.spawn(|| {
                self.up_to_5y
                    .compute_one_shot_states(block_price, date_price)
            });
            let up_to_7y_handle = scope.spawn(|| {
                self.up_to_7y
                    .compute_one_shot_states(block_price, date_price)
            });
            let up_to_10y_handle = scope.spawn(|| {
                self.up_to_10y
                    .compute_one_shot_states(block_price, date_price)
            });
            let up_to_15y_handle = scope.spawn(|| {
                self.up_to_15y
                    .compute_one_shot_states(block_price, date_price)
            });

            let from_1d_to_1w_handle = scope.spawn(|| {
                self.from_1d_to_1w
                    .compute_one_shot_states(block_price, date_price)
            });
            let from_1w_to_1m_handle = scope.spawn(|| {
                self.from_1w_to_1m
                    .compute_one_shot_states(block_price, date_price)
            });
            let from_1m_to_3m_handle = scope.spawn(|| {
                self.from_1m_to_3m
                    .compute_one_shot_states(block_price, date_price)
            });
            let from_3m_to_6m_handle = scope.spawn(|| {
                self.from_3m_to_6m
                    .compute_one_shot_states(block_price, date_price)
            });
            let from_6m_to_1y_handle = scope.spawn(|| {
                self.from_6m_to_1y
                    .compute_one_shot_states(block_price, date_price)
            });
            let from_1y_to_2y_handle = scope.spawn(|| {
                self.from_1y_to_2y
                    .compute_one_shot_states(block_price, date_price)
            });
            let from_2y_to_3y_handle = scope.spawn(|| {
                self.from_2y_to_3y
                    .compute_one_shot_states(block_price, date_price)
            });
            let from_3y_to_5y_handle = scope.spawn(|| {
                self.from_3y_to_5y
                    .compute_one_shot_states(block_price, date_price)
            });
            let from_5y_to_7y_handle = scope.spawn(|| {
                self.from_5y_to_7y
                    .compute_one_shot_states(block_price, date_price)
            });
            let from_7y_to_10y_handle = scope.spawn(|| {
                self.from_7y_to_10y
                    .compute_one_shot_states(block_price, date_price)
            });
            let from_10y_to_15y_handle = scope.spawn(|| {
                self.from_10y_to_15y
                    .compute_one_shot_states(block_price, date_price)
            });

            let from_1y_handle = scope.spawn(|| {
                self.from_1y
                    .compute_one_shot_states(block_price, date_price)
            });
            let from_2y_handle = scope.spawn(|| {
                self.from_2y
                    .compute_one_shot_states(block_price, date_price)
            });
            let from_4y_handle = scope.spawn(|| {
                self.from_4y
                    .compute_one_shot_states(block_price, date_price)
            });
            let from_10y_handle = scope.spawn(|| {
                self.from_10y
                    .compute_one_shot_states(block_price, date_price)
            });
            let from_15y_handle = scope.spawn(|| {
                self.from_15y
                    .compute_one_shot_states(block_price, date_price)
            });

            let year_2009_handle = scope.spawn(|| {
                self.year_2009
                    .compute_one_shot_states(block_price, date_price)
            });
            let year_2010_handle = scope.spawn(|| {
                self.year_2010
                    .compute_one_shot_states(block_price, date_price)
            });
            let year_2011_handle = scope.spawn(|| {
                self.year_2011
                    .compute_one_shot_states(block_price, date_price)
            });
            let year_2012_handle = scope.spawn(|| {
                self.year_2012
                    .compute_one_shot_states(block_price, date_price)
            });
            let year_2013_handle = scope.spawn(|| {
                self.year_2013
                    .compute_one_shot_states(block_price, date_price)
            });
            let year_2014_handle = scope.spawn(|| {
                self.year_2014
                    .compute_one_shot_states(block_price, date_price)
            });
            let year_2015_handle = scope.spawn(|| {
                self.year_2015
                    .compute_one_shot_states(block_price, date_price)
            });
            let year_2016_handle = scope.spawn(|| {
                self.year_2016
                    .compute_one_shot_states(block_price, date_price)
            });
            let year_2017_handle = scope.spawn(|| {
                self.year_2017
                    .compute_one_shot_states(block_price, date_price)
            });
            let year_2018_handle = scope.spawn(|| {
                self.year_2018
                    .compute_one_shot_states(block_price, date_price)
            });
            let year_2019_handle = scope.spawn(|| {
                self.year_2019
                    .compute_one_shot_states(block_price, date_price)
            });
            let year_2020_handle = scope.spawn(|| {
                self.year_2020
                    .compute_one_shot_states(block_price, date_price)
            });
            let year_2021_handle = scope.spawn(|| {
                self.year_2021
                    .compute_one_shot_states(block_price, date_price)
            });
            let year_2022_handle = scope.spawn(|| {
                self.year_2022
                    .compute_one_shot_states(block_price, date_price)
            });
            let year_2023_handle = scope.spawn(|| {
                self.year_2023
                    .compute_one_shot_states(block_price, date_price)
            });
            let year_2024_handle = scope.spawn(|| {
                self.year_2024
                    .compute_one_shot_states(block_price, date_price)
            });

            UTXOCohortsOneShotStates(SplitByUTXOCohort {
                sth: sth_handle.join().unwrap(),
                lth: lth_handle.join().unwrap(),

                up_to_1d: up_to_1d_handle.join().unwrap(),
                up_to_1w: up_to_1w_handle.join().unwrap(),
                up_to_1m: up_to_1m_handle.join().unwrap(),
                up_to_2m: up_to_2m_handle.join().unwrap(),
                up_to_3m: up_to_3m_handle.join().unwrap(),
                up_to_4m: up_to_4m_handle.join().unwrap(),
                up_to_5m: up_to_5m_handle.join().unwrap(),
                up_to_6m: up_to_6m_handle.join().unwrap(),
                up_to_1y: up_to_1y_handle.join().unwrap(),
                up_to_2y: up_to_2y_handle.join().unwrap(),
                up_to_3y: up_to_3y_handle.join().unwrap(),
                up_to_5y: up_to_5y_handle.join().unwrap(),
                up_to_7y: up_to_7y_handle.join().unwrap(),
                up_to_10y: up_to_10y_handle.join().unwrap(),
                up_to_15y: up_to_15y_handle.join().unwrap(),

                from_1d_to_1w: from_1d_to_1w_handle.join().unwrap(),
                from_1w_to_1m: from_1w_to_1m_handle.join().unwrap(),
                from_1m_to_3m: from_1m_to_3m_handle.join().unwrap(),
                from_3m_to_6m: from_3m_to_6m_handle.join().unwrap(),
                from_6m_to_1y: from_6m_to_1y_handle.join().unwrap(),
                from_1y_to_2y: from_1y_to_2y_handle.join().unwrap(),
                from_2y_to_3y: from_2y_to_3y_handle.join().unwrap(),
                from_3y_to_5y: from_3y_to_5y_handle.join().unwrap(),
                from_5y_to_7y: from_5y_to_7y_handle.join().unwrap(),
                from_7y_to_10y: from_7y_to_10y_handle.join().unwrap(),
                from_10y_to_15y: from_10y_to_15y_handle.join().unwrap(),

                from_1y: from_1y_handle.join().unwrap(),
                from_2y: from_2y_handle.join().unwrap(),
                from_4y: from_4y_handle.join().unwrap(),
                from_10y: from_10y_handle.join().unwrap(),
                from_15y: from_15y_handle.join().unwrap(),

                year_2009: year_2009_handle.join().unwrap(),
                year_2010: year_2010_handle.join().unwrap(),
                year_2011: year_2011_handle.join().unwrap(),
                year_2012: year_2012_handle.join().unwrap(),
                year_2013: year_2013_handle.join().unwrap(),
                year_2014: year_2014_handle.join().unwrap(),
                year_2015: year_2015_handle.join().unwrap(),
                year_2016: year_2016_handle.join().unwrap(),
                year_2017: year_2017_handle.join().unwrap(),
                year_2018: year_2018_handle.join().unwrap(),
                year_2019: year_2019_handle.join().unwrap(),
                year_2020: year_2020_handle.join().unwrap(),
                year_2021: year_2021_handle.join().unwrap(),
                year_2022: year_2022_handle.join().unwrap(),
                year_2023: year_2023_handle.join().unwrap(),
                year_2024: year_2024_handle.join().unwrap(),
            })
        })
    }
}
