use std::collections::BTreeMap;

use bitcoin::Amount;
use derive_deref::{Deref, DerefMut};

use super::{OneShotStates, UnrealizedState};

#[derive(Deref, DerefMut, Default, Debug)]
pub struct PriceInCentsToAmount(BTreeMap<u32, Amount>);

impl PriceInCentsToAmount {
    pub fn increment(&mut self, cents: u32, amount: Amount) {
        *self.entry(cents).or_default() += amount;
    }

    pub fn decrement(&mut self, cents: u32, amount: Amount) {
        let delete = {
            let _amount = self.get_mut(&cents);

            if _amount.is_none() {
                dbg!(&self.0, cents, amount);
                panic!();
            }

            let _amount = _amount.unwrap();

            *_amount -= amount;

            amount == Amount::ZERO
        };

        if delete {
            self.remove(&cents).unwrap();
        }
    }

    pub fn compute_one_shot_states(
        &self,
        supply: Amount,
        block_price: f32,
        date_price: Option<f32>,
    ) -> OneShotStates {
        let mut one_shot_states = OneShotStates::default();

        if date_price.is_some() {
            one_shot_states
                .unrealized_date_state
                .replace(UnrealizedState::default());
        }

        let mut processed_amount = Amount::ZERO;

        self.iter().for_each(|(cents, amount)| {
            let amount = *amount;

            processed_amount += amount;

            let mean_price_paid = (*cents as f32) / 100.0;

            one_shot_states
                .price_paid_state
                .iterate(mean_price_paid, amount, supply);

            one_shot_states
                .unrealized_block_state
                .iterate(mean_price_paid, block_price, amount);

            if let Some(unrealized_date_state) = one_shot_states.unrealized_date_state.as_mut() {
                unrealized_date_state.iterate(mean_price_paid, date_price.unwrap(), amount);
            }
        });

        if processed_amount != supply {
            dbg!(processed_amount, supply);
            panic!("processed_amount isn't equal to supply")
        }

        one_shot_states
    }
}
