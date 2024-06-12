use bitcoin::Amount;
use color_eyre::eyre::eyre;

use super::{OneShotStates, PriceInCentsToAmount, SupplyState, UTXOState};

#[derive(Default, Debug)]
pub struct DurableStates {
    price_in_cents_to_amount: PriceInCentsToAmount,

    pub supply_state: SupplyState,
    pub utxo_state: UTXOState,
}

impl DurableStates {
    pub fn increment(
        &mut self,
        amount: Amount,
        utxo_count: usize,
        price_in_cents: u32,
    ) -> color_eyre::Result<()> {
        if amount == Amount::ZERO {
            if utxo_count != 0 {
                dbg!(amount, amount.to_sat(), price_in_cents);
                return Err(eyre!("Shouldn't be possible"));
            }
        } else {
            self.supply_state.increment(amount);
            self.utxo_state.increment(utxo_count);
            self.price_in_cents_to_amount
                .increment(price_in_cents, amount);
        }

        Ok(())
    }

    pub fn decrement(
        &mut self,
        amount: Amount,
        utxo_count: usize,
        price_in_cents: u32,
    ) -> color_eyre::Result<()> {
        if amount == Amount::ZERO {
            if utxo_count != 0 {
                unreachable!("Shouldn't be possible")
            }
        } else {
            self.supply_state.decrement(amount)?;
            self.utxo_state.decrement(utxo_count)?;
            self.price_in_cents_to_amount
                .decrement(price_in_cents, amount)?;
        }

        Ok(())
    }

    pub fn compute_one_shot_states(
        &self,
        block_price: f32,
        date_price: Option<f32>,
    ) -> OneShotStates {
        self.price_in_cents_to_amount.compute_one_shot_states(
            self.supply_state.supply,
            block_price,
            date_price,
        )
    }
}
