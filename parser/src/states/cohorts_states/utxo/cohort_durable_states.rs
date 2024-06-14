use allocative::Allocative;

use crate::{
    states::{DurableStates, OneShotStates, PriceInCentsToValue, UnrealizedState},
    structs::WAmount,
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
        mean_cents_paid: u32,
    ) -> color_eyre::Result<()> {
        self._crement(amount, utxo_count, mean_cents_paid, true)
    }

    pub fn decrement(
        &mut self,
        amount: WAmount,
        utxo_count: usize,
        mean_cents_paid: u32,
    ) -> color_eyre::Result<()> {
        self._crement(amount, utxo_count, mean_cents_paid, false)
    }

    pub fn _crement(
        &mut self,
        amount: WAmount,
        utxo_count: usize,
        mean_cents_paid: u32,
        increment: bool,
    ) -> color_eyre::Result<()> {
        if increment {
            self.cents_to_amount.increment(mean_cents_paid, amount);
        } else {
            self.cents_to_amount
                .decrement(mean_cents_paid, amount)
                .inspect_err(|report| {
                    dbg!(
                        report,
                        "cents_to_amount decrement failed",
                        amount,
                        utxo_count
                    );
                })?;
        }

        if increment {
            self.durable_states.increment(amount, utxo_count)
        } else {
            self.durable_states.decrement(amount, utxo_count)
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
