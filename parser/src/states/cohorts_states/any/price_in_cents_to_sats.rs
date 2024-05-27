use std::collections::BTreeMap;

use derive_deref::{Deref, DerefMut};

use crate::bitcoin::sats_to_btc;

use super::{OneShotStates, UnrealizedState};

#[derive(Deref, DerefMut, Default, Debug)]
pub struct PriceInCentsToSats(BTreeMap<u32, u64>);

impl PriceInCentsToSats {
    pub fn increment(&mut self, cents: u32, amount: u64) {
        *self.entry(cents).or_default() += amount;
    }

    pub fn decrement(&mut self, cents: u32, amount: u64) {
        let delete = {
            let _amount = self.get_mut(&cents);

            if _amount.is_none() {
                dbg!(&self.0, cents, amount);
                panic!();
            }

            let _amount = _amount.unwrap();

            *_amount -= amount;

            amount == 0
        };

        if delete {
            self.remove(&cents).unwrap();
        }
    }

    pub fn compute_one_shot_states(
        &self,
        supply: u64,
        block_price: f32,
        date_price: Option<f32>,
    ) -> OneShotStates {
        let mut one_shot_states = OneShotStates::default();

        if date_price.is_some() {
            one_shot_states
                .unrealized_date_state
                .replace(UnrealizedState::default());
        }

        let mut processed_amount = 0;

        self.iter().for_each(|(cents, sats)| {
            let sats = *sats;

            processed_amount += sats;

            let mean_price_paid = (*cents as f32) / 100.0;

            let btc_amount = sats_to_btc(sats);

            one_shot_states
                .price_paid_state
                .iterate(mean_price_paid, btc_amount, sats, supply);

            one_shot_states.unrealized_block_state.iterate(
                mean_price_paid,
                block_price,
                sats,
                btc_amount,
            );

            if let Some(unrealized_date_state) = one_shot_states.unrealized_date_state.as_mut() {
                unrealized_date_state.iterate(
                    mean_price_paid,
                    date_price.unwrap(),
                    sats,
                    btc_amount,
                );
            }
        });

        if processed_amount != supply {
            dbg!(processed_amount, supply);
            panic!("processed_amount isn't equal to supply")
        }

        one_shot_states
    }
}
