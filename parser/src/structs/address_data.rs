use sanakirja::{direct_repr, Storable, UnsizedStorable};
use savefile_derive::Savefile;

use crate::bitcoin::sats_to_btc;

use super::{AddressType, EmptyAddressData, LiquidityClassification};

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Savefile)]
pub struct AddressData {
    pub address_type: AddressType,
    pub amount: u64,
    pub sent: u64,
    pub received: u64,
    pub mean_cents_paid: u32,
    pub outputs_len: u32,
}
direct_repr!(AddressData);

impl AddressData {
    pub fn new(address_type: AddressType) -> Self {
        Self {
            address_type,
            amount: 0,
            sent: 0,
            received: 0,
            mean_cents_paid: 0,
            outputs_len: 0,
        }
    }

    pub fn compute_liquidity_classification(&self) -> LiquidityClassification {
        LiquidityClassification::new(self.sent, self.received)
    }

    pub fn is_new(&self) -> bool {
        self.received == 0
    }

    pub fn receive(&mut self, sat_amount: u64, price: f32) {
        let previous_mean_cents_paid = self.mean_cents_paid;

        let previous_sat_amount = self.amount;
        let new_sat_amount = previous_sat_amount + sat_amount;

        let btc_amount = sats_to_btc(sat_amount);
        let priced_btc_value = btc_amount * price as f64;

        let previous_btc_amount = sats_to_btc(previous_sat_amount);
        let new_btc_amount = sats_to_btc(new_sat_amount);

        self.mean_cents_paid = ((previous_mean_cents_paid as f64 / 100.0 * previous_btc_amount
            + priced_btc_value)
            / new_btc_amount
            * 100.0) as u32;

        self.amount = new_sat_amount;

        self.received += sat_amount;

        self.outputs_len += 1;
    }

    pub fn send(&mut self, sat_amount: u64, price: f32) -> f32 {
        let previous_mean_cents_paid = self.mean_cents_paid;

        let previous_sat_amount = self.amount;
        let new_sat_amount = previous_sat_amount - sat_amount;

        let btc_value = sats_to_btc(sat_amount);
        let priced_btc_value = btc_value * price as f64;

        let previous_btc_amount = sats_to_btc(previous_sat_amount);
        let new_btc_amount = sats_to_btc(new_sat_amount);

        self.mean_cents_paid = (((previous_mean_cents_paid as f64 / 100.0 * previous_btc_amount)
            - priced_btc_value)
            / new_btc_amount
            * 100.0) as u32;

        self.amount = new_sat_amount;

        self.sent += sat_amount;

        self.outputs_len -= 1;

        // realized_profit_or_loss
        (priced_btc_value - (btc_value * previous_mean_cents_paid as f64 * 100.0)) as f32
    }

    #[inline(always)]
    pub fn is_empty(&self) -> bool {
        self.amount == 0
    }

    pub fn from_empty(empty: &EmptyAddressData) -> Self {
        Self {
            address_type: empty.address_type,
            amount: 0,
            sent: empty.transfered,
            received: empty.transfered,
            mean_cents_paid: 0,
            outputs_len: 0,
        }
    }
}
