use derive_deref::{Deref, DerefMut};

use crate::{
    bitcoin::sats_to_btc,
    states::InputState,
    structs::{AddressRealizedData, LiquidityClassification, SplitByLiquidity},
};

use super::SplitByAddressCohort;

#[derive(Deref, DerefMut, Default)]
pub struct AddressCohortsInputStates(SplitByAddressCohort<SplitByLiquidity<InputState>>);

impl AddressCohortsInputStates {
    pub fn iterate_input(
        &mut self,
        realized_data: &AddressRealizedData,
        liquidity_classification: &LiquidityClassification,
    ) {
        let count = realized_data.utxos_destroyed as f64;
        let volume = sats_to_btc(realized_data.sent);

        let split_count = liquidity_classification.split(count);
        let split_volume = liquidity_classification.split(volume);

        let iterate = move |state: &mut SplitByLiquidity<InputState>| {
            state.all.iterate(count, volume);

            state
                .illiquid
                .iterate(split_count.illiquid, split_volume.illiquid);

            state
                .liquid
                .iterate(split_count.liquid, split_volume.liquid);

            state
                .highly_liquid
                .iterate(split_count.highly_liquid, split_volume.highly_liquid);
        };

        self.iterate(&realized_data.initial_address_data, iterate);
    }
}
