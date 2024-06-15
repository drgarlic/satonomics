use allocative::Allocative;

use crate::{
    states::{DurableStates, OneShotStates, PriceInCentsToValue, UnrealizedState},
    structs::{Price, WAmount},
};

#[derive(Default, Debug, Allocative)]
pub struct UTXOCohortDurableStates {
    pub durable_states: DurableStates,
    pub cents_to_amount: PriceInCentsToValue<WAmount>,
}

impl UTXOCohortDurableStates {
    pub fn increment(
        &mut self,
        amount: WAmount,
        utxo_count: usize,
        price: Price,
    ) -> color_eyre::Result<()> {
        self._crement(amount, utxo_count, price, true)
    }

    pub fn decrement(
        &mut self,
        amount: WAmount,
        utxo_count: usize,
        price: Price,
    ) -> color_eyre::Result<()> {
        self._crement(amount, utxo_count, price, false)
    }

    pub fn _crement(
        &mut self,
        amount: WAmount,
        utxo_count: usize,
        price: Price,
        increment: bool,
    ) -> color_eyre::Result<()> {
        let price = price.to_significant();

        if increment {
            self.cents_to_amount.increment(price, amount);
        } else {
            self.cents_to_amount
                .decrement(price, amount)
                .inspect_err(|report| {
                    dbg!(
                        report,
                        "cents_to_amount decrement failed",
                        amount,
                        utxo_count
                    );
                })?;
        }

        let realized_cap = price * amount;

        if increment {
            self.durable_states
                .increment(amount, utxo_count, realized_cap)
        } else {
            self.durable_states
                .decrement(amount, utxo_count, realized_cap)
        }
        .inspect_err(|report| {
            dbg!(report, "split all failed", amount, utxo_count);
        })
    }

    pub fn compute_one_shot_states(
        &self,
        block_price: Price,
        date_price: Option<Price>,
    ) -> OneShotStates {
        let mut one_shot_states = OneShotStates::default();

        if date_price.is_some() {
            one_shot_states
                .unrealized_date_state
                .replace(UnrealizedState::default());
        }

        let supply = self.durable_states.supply_state.supply;

        let one_shot_states_ref = &mut one_shot_states;

        self.cents_to_amount.iterate(supply, |price_paid, amount| {
            one_shot_states_ref
                .price_paid_state
                .iterate(price_paid, amount, supply);

            one_shot_states_ref
                .unrealized_block_state
                .iterate(price_paid, block_price, amount);

            if let Some(unrealized_date_state) = one_shot_states_ref.unrealized_date_state.as_mut()
            {
                unrealized_date_state.iterate(price_paid, date_price.unwrap(), amount);
            }
        });

        one_shot_states
    }
}
