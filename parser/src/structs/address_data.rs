use allocative::Allocative;
use color_eyre::eyre::eyre;
use sanakirja::{direct_repr, Storable, UnsizedStorable};

use super::{AddressType, EmptyAddressData, LiquidityClassification, WAmount};

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Default, Allocative)]
pub struct AddressData {
    pub address_type: AddressType,
    pub amount: WAmount,
    pub sent: WAmount,
    pub received: WAmount,
    pub realized_cap_in_cents: u64,
    pub outputs_len: u32,
}
direct_repr!(AddressData);

impl AddressData {
    pub fn new(address_type: AddressType) -> Self {
        Self {
            address_type,
            amount: WAmount::ZERO,
            sent: WAmount::ZERO,
            received: WAmount::ZERO,
            realized_cap_in_cents: 0,
            outputs_len: 0,
        }
    }

    pub fn receive(&mut self, amount: WAmount, price: f32) {
        let previous_amount = self.amount;
        let new_amount = previous_amount + amount;

        let received_btc_amount = amount.to_btc();
        let received_dollar_value = received_btc_amount * price as f64;

        self.realized_cap_in_cents += (received_dollar_value * 100.0) as u64;

        self.amount = new_amount;

        self.received += amount;

        self.outputs_len += 1;
    }

    pub fn send(
        &mut self,
        amount: WAmount,
        current_price: f32,
        sent_amount_price: f32,
    ) -> color_eyre::Result<f32> {
        let previous_amount = self.amount;

        if previous_amount < amount {
            return Err(eyre!("previous_amount smaller than sent amount"));
        }

        let new_amount = previous_amount - amount;

        let previous_btc_amount = previous_amount.to_btc();
        let sent_btc_amount = amount.to_btc();

        let previous_sent_dollar_value = previous_btc_amount * sent_amount_price as f64;

        self.amount = new_amount;

        self.sent += amount;

        self.outputs_len -= 1;

        self.realized_cap_in_cents -= (sent_btc_amount * sent_amount_price as f64 * 100.0) as u64;

        let current_sent_dollar_value = sent_btc_amount * current_price as f64;

        // realized_profit_or_loss
        Ok((current_sent_dollar_value - previous_sent_dollar_value) as f32)
    }

    #[inline(always)]
    pub fn is_empty(&self) -> bool {
        if self.amount == WAmount::ZERO {
            if self.outputs_len != 0 {
                unreachable!();
            }

            true
        } else {
            false
        }
    }

    pub fn from_empty(empty: &EmptyAddressData) -> Self {
        Self {
            address_type: empty.address_type,
            amount: WAmount::ZERO,
            sent: empty.transfered,
            received: empty.transfered,
            realized_cap_in_cents: 0,
            outputs_len: 0,
        }
    }

    pub fn compute_liquidity_classification(&self) -> LiquidityClassification {
        LiquidityClassification::new(self.sent, self.received)
    }
}
