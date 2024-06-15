use allocative::Allocative;

use crate::{
    states::{DurableStates, OneShotStates, PriceInCentsToValue, UnrealizedState},
    structs::WAmount,
    utils::convert_price_to_significant_cents,
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
        price: f32,
    ) -> color_eyre::Result<()> {
        self._crement(amount, utxo_count, price, true)
    }

    pub fn decrement(
        &mut self,
        amount: WAmount,
        utxo_count: usize,
        price: f32,
    ) -> color_eyre::Result<()> {
        self._crement(amount, utxo_count, price, false)
    }

    pub fn _crement(
        &mut self,
        amount: WAmount,
        utxo_count: usize,
        price: f32,
        increment: bool,
    ) -> color_eyre::Result<()> {
        let price_in_cents = convert_price_to_significant_cents(price);

        if increment {
            self.cents_to_amount.increment(price_in_cents, amount);
        } else {
            self.cents_to_amount
                .decrement(price_in_cents, amount)
                .inspect_err(|report| {
                    dbg!(
                        report,
                        "cents_to_amount decrement failed",
                        amount,
                        utxo_count
                    );
                })?;
        }

        let realized_cap_in_cents = (amount.to_btc() * price as f64 * 100.0) as u64;

        if increment {
            self.durable_states
                .increment(amount, utxo_count, realized_cap_in_cents)
        } else {
            self.durable_states
                .decrement(amount, utxo_count, realized_cap_in_cents)
        }
        .inspect_err(|report| {
            dbg!(report, "split all failed", amount, utxo_count);
        })
    }

    pub fn compute_one_shot_states(
        &self,
        block_price: f32,
        date_price: Option<f32>,
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
