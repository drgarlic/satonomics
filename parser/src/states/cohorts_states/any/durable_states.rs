use allocative::Allocative;

use color_eyre::eyre::eyre;

use crate::structs::WAmount;

use super::{SupplyState, UTXOState};

#[derive(Default, Debug, Allocative)]
pub struct DurableStates {
    pub supply_state: SupplyState,
    pub utxo_state: UTXOState,
}

impl DurableStates {
    pub fn increment(&mut self, amount: WAmount, utxo_count: usize) -> color_eyre::Result<()> {
        if amount == WAmount::ZERO {
            if utxo_count != 0 {
                dbg!(amount, utxo_count);
                return Err(eyre!("Shouldn't be possible"));
            }
        } else {
            self.supply_state.increment(amount);
            self.utxo_state.increment(utxo_count);
        }

        Ok(())
    }

    pub fn decrement(&mut self, amount: WAmount, utxo_count: usize) -> color_eyre::Result<()> {
        if amount == WAmount::ZERO {
            if utxo_count != 0 {
                dbg!(amount, utxo_count);
                unreachable!("Shouldn't be possible")
            }
        } else {
            self.supply_state.decrement(amount)?;
            self.utxo_state.decrement(utxo_count)?;
        }

        Ok(())
    }
}
