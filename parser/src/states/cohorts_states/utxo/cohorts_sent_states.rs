use std::collections::BTreeMap;

use derive_deref::{Deref, DerefMut};

use crate::{
    actions::SentData,
    states::{DateDataVec, InputState, RealizedState},
    structs::BlockPath,
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
        current_price: f32,
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

                    let amount_sent_as_btc = amount_sent.to_btc();

                    self.initial_filtered_apply(&days_old, &year, |state| {
                        state.input.iterate(sent_data.count as f64, amount_sent);

                        let previous_dollar_amount = previous_price * amount_sent_as_btc as f32;
                        let current_dollar_amount = current_price * amount_sent_as_btc as f32;

                        if previous_dollar_amount < current_dollar_amount {
                            state.realized.realized_profit +=
                                current_dollar_amount - previous_dollar_amount;
                        } else if current_dollar_amount < previous_dollar_amount {
                            state.realized.realized_loss +=
                                previous_dollar_amount - current_dollar_amount;
                        }
                    })
                })
        }
    }
}
