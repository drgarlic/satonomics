use super::{OneShotStates, PriceInCentsToSats, SupplyState, UTXOState};

#[derive(Default, Debug)]
pub struct DurableStates {
    price_in_cents_to_sats: PriceInCentsToSats,

    pub supply_state: SupplyState,
    pub utxo_state: UTXOState,
}

impl DurableStates {
    pub fn increment(&mut self, amount: u64, utxo_count: usize, price_in_cents: u32) {
        if amount == 0 {
            if utxo_count != 0 {
                unreachable!("Shouldn't be possible")
            }
            return;
        }

        self.supply_state.increment(amount);
        self.utxo_state.increment(utxo_count);
        self.price_in_cents_to_sats
            .increment(price_in_cents, amount);
    }

    pub fn decrement(&mut self, amount: u64, utxo_count: usize, price_in_cents: u32) {
        if amount == 0 {
            if utxo_count != 0 {
                unreachable!("Shouldn't be possible")
            }
            return;
        }

        self.supply_state.decrement(amount);
        self.utxo_state.decrement(utxo_count);
        self.price_in_cents_to_sats
            .decrement(price_in_cents, amount);
    }

    pub fn compute_one_shot_states(
        &self,
        block_price: f32,
        date_price: Option<f32>,
    ) -> OneShotStates {
        self.price_in_cents_to_sats.compute_on_shot_states(
            self.supply_state.supply,
            block_price,
            date_price,
        )
    }
}
