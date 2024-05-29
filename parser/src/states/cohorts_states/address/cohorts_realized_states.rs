use derive_deref::{Deref, DerefMut};

use crate::{
    states::RealizedState,
    structs::{AddressRealizedData, LiquidityClassification, SplitByLiquidity},
};

use super::SplitByAddressCohort;

#[derive(Deref, DerefMut, Default)]
pub struct AddressCohortsRealizedStates(SplitByAddressCohort<SplitByLiquidity<RealizedState>>);

impl AddressCohortsRealizedStates {
    pub fn iterate_realized(
        &mut self,
        realized_data: &AddressRealizedData,
        liquidity_classification: &LiquidityClassification,
    ) {
        let profit = realized_data.profit as f64;
        let loss = realized_data.loss as f64;

        let split_profit = liquidity_classification.split(profit);
        let split_loss = liquidity_classification.split(loss);

        let iterate = move |state: &mut SplitByLiquidity<RealizedState>| {
            state.all.iterate(profit as f32, loss as f32);

            state
                .illiquid
                .iterate(split_profit.illiquid as f32, split_loss.illiquid as f32);

            state
                .liquid
                .iterate(split_profit.liquid as f32, split_loss.liquid as f32);

            state.highly_liquid.iterate(
                split_profit.highly_liquid as f32,
                split_loss.highly_liquid as f32,
            );
        };

        self.iterate(&realized_data.initial_address_data, iterate);
    }
}
