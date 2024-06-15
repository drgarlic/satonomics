use std::{cmp::Ordering, collections::BTreeMap};

use derive_deref::{Deref, DerefMut};

use crate::{
    actions::SentData,
    states::{DateDataVec, InputState, RealizedState},
    structs::{BlockPath, Price},
    utils::{difference_in_days_between_timestamps, timestamp_to_year},
};

use super::SplitByUTXOCohort;

#[derive(Default, Debug)]
pub struct SentState {
    pub input: InputState,
    pub realized: RealizedState,
}

#[derive(Deref, DerefMut, Default)]
pub struct UTXOCohortsSentStates(SplitByUTXOCohort<SentState>);

impl UTXOCohortsSentStates {
    pub fn compute(
        &mut self,
        date_data_vec: &DateDataVec,
        block_path_to_sent_data: &BTreeMap<BlockPath, SentData>,
        current_price: Price,
    ) {
        if let Some(last_block_data) = date_data_vec.last_block() {
            block_path_to_sent_data
                .iter()
                .map(|(block_path, data)| (date_data_vec.get(block_path).unwrap(), data))
                .for_each(|(block_data, sent_data)| {
                    let days_old = difference_in_days_between_timestamps(
                        block_data.timestamp,
                        last_block_data.timestamp,
                    );

                    let year = timestamp_to_year(block_data.timestamp);

                    let previous_price = block_data.price;

                    let amount_sent = sent_data.volume;

                    self.initial_filtered_apply(&days_old, &year, |state| {
                        state.input.iterate(sent_data.count as f64, amount_sent);

                        let previous_value = previous_price * amount_sent;
                        let current_value = current_price * amount_sent;

                        match previous_value.cmp(&current_value) {
                            Ordering::Less => {
                                state.realized.realized_profit += current_value - previous_value;
                            }
                            Ordering::Greater => {
                                state.realized.realized_loss += previous_value - current_value;
                            }
                            Ordering::Equal => {}
                        }
                    })
                })
        }
    }
}
