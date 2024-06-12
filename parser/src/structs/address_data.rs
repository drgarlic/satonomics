use bitcoin::Amount;
use color_eyre::eyre::eyre;
use sanakirja::{direct_repr, Storable, UnsizedStorable};

use super::{AddressType, EmptyAddressData, LiquidityClassification};

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Default)]
pub struct AddressData {
    pub address_type: AddressType,
    pub amount: Amount,
    pub sent: Amount,
    pub received: Amount,
    pub mean_cents_paid: u32,
    pub outputs_len: u32,
}
direct_repr!(AddressData);

impl AddressData {
    pub fn new(address_type: AddressType) -> Self {
        Self {
            address_type,
            amount: Amount::ZERO,
            sent: Amount::ZERO,
            received: Amount::ZERO,
            mean_cents_paid: 0,
            outputs_len: 0,
        }
    }

    pub fn compute_liquidity_classification(&self) -> LiquidityClassification {
        LiquidityClassification::new(self.sent, self.received)
    }

    pub fn receive(&mut self, amount: Amount, price: f32) {
        let previous_mean_cents_paid = self.mean_cents_paid;

        let previous_amount = self.amount;
        let new_amount = previous_amount + amount;

        let received_amount_in_btc = amount.to_btc();
        let received_dollar_value = received_amount_in_btc * price as f64;

        let previous_btc_amount = previous_amount.to_btc();
        let new_btc_amount = new_amount.to_btc();

        self.mean_cents_paid = ((previous_mean_cents_paid as f64 / 100.0 * previous_btc_amount
            + received_dollar_value)
            / new_btc_amount
            * 100.0)
            .round() as u32;

        self.amount = new_amount;

        self.received += amount;

        self.outputs_len += 1;
    }

    pub fn send(&mut self, amount: Amount, price: f32) -> color_eyre::Result<f32> {
        let previous_mean_cents_paid = self.mean_cents_paid;

        let previous_amount = self.amount;

        if previous_amount < amount {
            return Err(eyre!("previous_amount smaller than sent amount"));
        }

        let new_amount = previous_amount - amount;

        let sent_amount_in_btc = amount.to_btc();
        let sent_dollar_value = sent_amount_in_btc * price as f64;

        // let previous_btc_amount = previous_amount.to_btc();
        // let new_btc_amount = new_amount.to_btc();

        // self.mean_cents_paid = (((previous_mean_cents_paid as f64 / 100.0 * previous_btc_amount)
        //     - sent_dollar_value)
        //     / new_btc_amount
        //     * 100.0)
        //     .round() as u32;

        self.amount = new_amount;

        self.sent += amount;

        self.outputs_len -= 1;

        // realized_profit_or_loss
        Ok(
            (sent_dollar_value - (sent_amount_in_btc * previous_mean_cents_paid as f64 / 100.0))
                as f32,
        )
    }

    #[inline(always)]
    pub fn is_empty(&self) -> bool {
        if self.amount == Amount::ZERO {
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
            amount: Amount::ZERO,
            sent: empty.transfered,
            received: empty.transfered,
            mean_cents_paid: 0,
            outputs_len: 0,
        }
    }
}
