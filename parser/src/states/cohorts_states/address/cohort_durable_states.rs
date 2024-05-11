use std::thread;

use crate::{
    states::{DurableStates, OneShotStates},
    structs::{LiquiditySplitResult, SplitByLiquidity},
};

#[derive(Default)]
pub struct AddressCohortDurableStates {
    pub address_count: usize,
    pub split: SplitByLiquidity<DurableStates>,
}

impl AddressCohortDurableStates {
    pub fn increment(
        &mut self,
        sats: u64,
        utxo_count: usize,
        mean_cents_paid: u32,
        split_sat_amount: &LiquiditySplitResult,
        split_utxo_count: &LiquiditySplitResult,
    ) {
        self.address_count += 1;

        self.split.all.increment(sats, utxo_count, mean_cents_paid);

        self.split.illiquid.increment(
            split_sat_amount.illiquid.round() as u64,
            split_utxo_count.illiquid.round() as usize,
            mean_cents_paid,
        );

        self.split.liquid.increment(
            split_sat_amount.liquid.round() as u64,
            split_utxo_count.liquid.round() as usize,
            mean_cents_paid,
        );

        self.split.highly_liquid.increment(
            split_sat_amount.highly_liquid.round() as u64,
            split_utxo_count.highly_liquid.round() as usize,
            mean_cents_paid,
        );
    }

    pub fn decrement(
        &mut self,
        sats: u64,
        utxo_count: usize,
        mean_cents_paid: u32,
        split_sat_amount: &LiquiditySplitResult,
        split_utxo_count: &LiquiditySplitResult,
    ) {
        self.address_count -= 1;

        self.split.all.decrement(sats, utxo_count, mean_cents_paid);

        self.split.illiquid.decrement(
            split_sat_amount.illiquid.round() as u64,
            split_utxo_count.illiquid.round() as usize,
            mean_cents_paid,
        );

        self.split.liquid.decrement(
            split_sat_amount.liquid.round() as u64,
            split_utxo_count.liquid.round() as usize,
            mean_cents_paid,
        );

        self.split.highly_liquid.decrement(
            split_sat_amount.highly_liquid.round() as u64,
            split_utxo_count.highly_liquid.round() as usize,
            mean_cents_paid,
        );
    }

    pub fn compute_one_shot_states(
        &self,
        block_price: f32,
        date_price: Option<f32>,
    ) -> SplitByLiquidity<OneShotStates> {
        thread::scope(|scope| {
            let all_handle = scope.spawn(|| {
                self.split
                    .all
                    .compute_one_shot_states(block_price, date_price)
            });

            let illiquid_handle = scope.spawn(|| {
                self.split
                    .illiquid
                    .compute_one_shot_states(block_price, date_price)
            });

            let liquid_handle = scope.spawn(|| {
                self.split
                    .liquid
                    .compute_one_shot_states(block_price, date_price)
            });

            let highly_liquid_handle = scope.spawn(|| {
                self.split
                    .highly_liquid
                    .compute_one_shot_states(block_price, date_price)
            });

            SplitByLiquidity {
                all: all_handle.join().unwrap(),
                illiquid: illiquid_handle.join().unwrap(),
                liquid: liquid_handle.join().unwrap(),
                highly_liquid: highly_liquid_handle.join().unwrap(),
            }
        })
    }
}
