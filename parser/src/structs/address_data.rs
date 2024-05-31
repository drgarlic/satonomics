use bitcoin::Amount;
use sanakirja::{direct_repr, Storable, UnsizedStorable};
use savefile_derive::Savefile;

use super::{AddressType, EmptyAddressData, LiquidityClassification, WAmount};

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Savefile)]
pub struct AddressData {
    pub address_type: AddressType,
    pub amount: WAmount,
    pub sent: WAmount,
    pub received: WAmount,
    pub mean_cents_paid: u32,
    pub outputs_len: u32,
}
direct_repr!(AddressData);

impl AddressData {
    pub fn new(address_type: AddressType) -> Self {
        Self {
            address_type,
            amount: WAmount::wrap(Amount::ZERO),
            sent: WAmount::wrap(Amount::ZERO),
            received: WAmount::wrap(Amount::ZERO),
            mean_cents_paid: 0,
            outputs_len: 0,
        }
    }

    pub fn compute_liquidity_classification(&self) -> LiquidityClassification {
        LiquidityClassification::new(*self.sent, *self.received)
    }

    pub fn is_new(&self) -> bool {
        *self.received == Amount::ZERO
    }

    pub fn receive(&mut self, amount: Amount, price: f32) {
        let previous_mean_cents_paid = self.mean_cents_paid;

        let previous_amount = *self.amount;
        let new_amount = previous_amount + amount;

        let priced_btc_value = amount.to_btc() * price as f64;

        let previous_btc_amount = previous_amount.to_btc();
        let new_btc_amount = new_amount.to_btc();

        self.mean_cents_paid = ((previous_mean_cents_paid as f64 / 100.0 * previous_btc_amount
            + priced_btc_value)
            / new_btc_amount
            * 100.0) as u32;

        *self.amount = new_amount;

        *self.received += amount;

        self.outputs_len += 1;
    }

    pub fn send(&mut self, amount: Amount, price: f32) -> f32 {
        let previous_mean_cents_paid = self.mean_cents_paid;

        let previous_amount = *self.amount;
        let new_amount = previous_amount - amount;

        let amount_in_btc = amount.to_btc();
        let priced_btc_value = amount_in_btc * price as f64;

        let previous_btc_amount = previous_amount.to_btc();
        let new_btc_amount = new_amount.to_btc();

        self.mean_cents_paid = (((previous_mean_cents_paid as f64 / 100.0 * previous_btc_amount)
            - priced_btc_value)
            / new_btc_amount
            * 100.0) as u32;

        *self.amount = new_amount;

        *self.sent += amount;

        self.outputs_len -= 1;

        // realized_profit_or_loss
        (priced_btc_value - (amount_in_btc * previous_mean_cents_paid as f64 * 100.0)) as f32
    }

    #[inline(always)]
    pub fn is_empty(&self) -> bool {
        *self.amount == Amount::ZERO
    }

    pub fn from_empty(empty: &EmptyAddressData) -> Self {
        Self {
            address_type: empty.address_type,
            amount: WAmount::wrap(Amount::ZERO),
            sent: WAmount::wrap(empty.transfered),
            received: WAmount::wrap(empty.transfered),
            mean_cents_paid: 0,
            outputs_len: 0,
        }
    }
}
