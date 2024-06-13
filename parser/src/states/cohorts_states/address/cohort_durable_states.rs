use bitcoin::Amount;

use crate::{
    states::{DurableStates, OneShotStates, PriceInCentsToValue, UnrealizedState},
    structs::{LiquiditySplitResult, SplitByLiquidity},
};

#[derive(Default, Debug)]
pub struct AddressCohortDurableStates {
    pub address_count: usize,
    pub split_durable_states: SplitByLiquidity<DurableStates>,
    pub cents_to_split_amount: PriceInCentsToValue<SplitByLiquidity<Amount>>,
}

const ONE_THIRD: f64 = 0.33333333333;

impl AddressCohortDurableStates {
    pub fn increment(
        &mut self,
        amount: Amount,
        utxo_count: usize,
        mean_cents_paid: u32,
        split_amount: &LiquiditySplitResult,
        split_utxo_count: &LiquiditySplitResult,
    ) -> color_eyre::Result<()> {
        self.address_count += 1;

        self._crement(
            amount,
            utxo_count,
            mean_cents_paid,
            split_amount,
            split_utxo_count,
            true,
        )
    }

    pub fn decrement(
        &mut self,
        amount: Amount,
        utxo_count: usize,
        mean_cents_paid: u32,
        split_amount: &LiquiditySplitResult,
        split_utxo_count: &LiquiditySplitResult,
    ) -> color_eyre::Result<()> {
        self.address_count -= 1;

        self._crement(
            amount,
            utxo_count,
            mean_cents_paid,
            split_amount,
            split_utxo_count,
            false,
        )
    }

    pub fn _crement(
        &mut self,
        amount: Amount,
        utxo_count: usize,
        mean_cents_paid: u32,
        split_amount_result: &LiquiditySplitResult,
        split_utxo_count_result: &LiquiditySplitResult,
        increment: bool,
    ) -> color_eyre::Result<()> {
        if increment {
            self.split_durable_states.all.increment(amount, utxo_count)
        } else {
            self.split_durable_states.all.decrement(amount, utxo_count)
        }
        .inspect_err(|report| {
            dbg!(
                report,
                "split all failed",
                split_amount_result,
                split_utxo_count_result
            );
        })?;

        let illiquid_amount = split_amount_result.illiquid.trunc();
        let illiquid_amount_rest = split_amount_result.illiquid - illiquid_amount;
        let mut illiquid_amount = Amount::from_sat(illiquid_amount as u64);
        let mut illiquid_utxo_count = split_utxo_count_result.illiquid.trunc() as usize;
        let illiquid_utxo_count_rest = split_utxo_count_result.illiquid.fract();

        let liquid_amount = split_amount_result.liquid.trunc();
        let liquid_amount_rest = split_amount_result.liquid - liquid_amount;
        let mut liquid_amount = Amount::from_sat(liquid_amount as u64);
        let mut liquid_utxo_count = split_utxo_count_result.liquid.trunc() as usize;
        let liquid_utxo_count_rest = split_utxo_count_result.liquid.fract();

        let mut highly_liquid_amount = amount - illiquid_amount - liquid_amount;
        let mut highly_liquid_utxo_count = utxo_count - illiquid_utxo_count - liquid_utxo_count;

        let amount_diff = amount - illiquid_amount - liquid_amount - highly_liquid_amount;
        if amount_diff > Amount::ZERO {
            if illiquid_amount_rest >= ONE_THIRD && illiquid_amount_rest > liquid_amount_rest {
                illiquid_amount += amount_diff;
            } else if illiquid_amount_rest >= ONE_THIRD {
                liquid_amount += amount_diff;
            } else {
                highly_liquid_amount += amount_diff;
            }
        }

        let utxo_count_diff =
            utxo_count - illiquid_utxo_count - liquid_utxo_count - highly_liquid_utxo_count;
        if utxo_count_diff > 0 {
            if illiquid_utxo_count_rest >= ONE_THIRD
                && illiquid_utxo_count_rest > liquid_utxo_count_rest
            {
                illiquid_utxo_count += utxo_count_diff;
            } else if illiquid_utxo_count_rest >= ONE_THIRD {
                liquid_utxo_count += utxo_count_diff;
            } else {
                highly_liquid_utxo_count += utxo_count_diff;
            }
        }

        let split_amount = SplitByLiquidity {
            all: amount,
            illiquid: illiquid_amount,
            liquid: liquid_amount,
            highly_liquid: highly_liquid_amount,
        };

        let split_utxo_count = SplitByLiquidity {
            all: utxo_count,
            illiquid: illiquid_utxo_count,
            liquid: liquid_utxo_count,
            highly_liquid: highly_liquid_utxo_count,
        };

        if increment {
            self.cents_to_split_amount
                .increment(mean_cents_paid, split_amount);
        } else {
            self.cents_to_split_amount
                .decrement(mean_cents_paid, split_amount)
                .inspect_err(|report| {
                    dbg!(
                        report,
                        "cents_to_split_amount decrement",
                        split_amount_result,
                        split_utxo_count_result,
                        split_amount,
                        split_utxo_count,
                    );
                })?;
        }

        if increment {
            self.split_durable_states
                .illiquid
                .increment(illiquid_amount, illiquid_utxo_count)
        } else {
            self.split_durable_states
                .illiquid
                .decrement(illiquid_amount, illiquid_utxo_count)
        }
        .inspect_err(|report| {
            dbg!(
                report,
                "split illiquid failed",
                split_amount_result,
                split_utxo_count_result,
                split_amount,
                split_utxo_count,
            );
        })?;

        if increment {
            self.split_durable_states
                .liquid
                .increment(liquid_amount, liquid_utxo_count)
        } else {
            self.split_durable_states
                .liquid
                .decrement(liquid_amount, liquid_utxo_count)
        }
        .inspect_err(|report| {
            dbg!(
                report,
                "split liquid failed",
                split_amount_result,
                split_utxo_count_result,
                split_amount,
                split_utxo_count,
            );
        })?;

        if increment {
            self.split_durable_states
                .highly_liquid
                .increment(highly_liquid_amount, highly_liquid_utxo_count)
        } else {
            self.split_durable_states
                .highly_liquid
                .decrement(highly_liquid_amount, highly_liquid_utxo_count)
        }
        .inspect_err(|report| {
            dbg!(
                report,
                "split highly liquid failed",
                split_amount_result,
                split_utxo_count_result,
                split_amount,
                split_utxo_count,
            );
        })?;

        Ok(())
    }

    pub fn compute_one_shot_states(
        &self,
        block_price: f32,
        date_price: Option<f32>,
    ) -> SplitByLiquidity<OneShotStates> {
        let mut one_shot_states: SplitByLiquidity<OneShotStates> = SplitByLiquidity::default();

        if date_price.is_some() {
            one_shot_states
                .all
                .unrealized_date_state
                .replace(UnrealizedState::default());
            one_shot_states
                .illiquid
                .unrealized_date_state
                .replace(UnrealizedState::default());
            one_shot_states
                .liquid
                .unrealized_date_state
                .replace(UnrealizedState::default());
            one_shot_states
                .highly_liquid
                .unrealized_date_state
                .replace(UnrealizedState::default());
        }

        let all_supply = self.split_durable_states.all.supply_state.supply;
        let illiquid_supply = self.split_durable_states.illiquid.supply_state.supply;
        let liquid_supply = self.split_durable_states.liquid.supply_state.supply;
        let highly_liquid_supply = self.split_durable_states.highly_liquid.supply_state.supply;

        let one_shot_states_ref = &mut one_shot_states;

        self.cents_to_split_amount.iterate(
            SplitByLiquidity {
                all: all_supply,
                illiquid: illiquid_supply,
                liquid: liquid_supply,
                highly_liquid: highly_liquid_supply,
            },
            |price_paid, split_amount| {
                one_shot_states_ref.all.price_paid_state.iterate(
                    price_paid,
                    split_amount.all,
                    all_supply,
                );
                one_shot_states_ref.illiquid.price_paid_state.iterate(
                    price_paid,
                    split_amount.illiquid,
                    illiquid_supply,
                );
                one_shot_states_ref.liquid.price_paid_state.iterate(
                    price_paid,
                    split_amount.liquid,
                    liquid_supply,
                );
                one_shot_states_ref.highly_liquid.price_paid_state.iterate(
                    price_paid,
                    split_amount.highly_liquid,
                    highly_liquid_supply,
                );

                one_shot_states_ref.all.unrealized_block_state.iterate(
                    price_paid,
                    block_price,
                    split_amount.all,
                );
                one_shot_states_ref.illiquid.unrealized_block_state.iterate(
                    price_paid,
                    block_price,
                    split_amount.illiquid,
                );
                one_shot_states_ref.liquid.unrealized_block_state.iterate(
                    price_paid,
                    block_price,
                    split_amount.liquid,
                );
                one_shot_states_ref
                    .highly_liquid
                    .unrealized_block_state
                    .iterate(price_paid, block_price, split_amount.highly_liquid);

                if let Some(unrealized_date_state) =
                    one_shot_states_ref.all.unrealized_date_state.as_mut()
                {
                    unrealized_date_state.iterate(
                        price_paid,
                        date_price.unwrap(),
                        split_amount.all,
                    );
                }

                if let Some(unrealized_date_state) =
                    one_shot_states_ref.illiquid.unrealized_date_state.as_mut()
                {
                    unrealized_date_state.iterate(
                        price_paid,
                        date_price.unwrap(),
                        split_amount.illiquid,
                    );
                }

                if let Some(unrealized_date_state) =
                    one_shot_states_ref.liquid.unrealized_date_state.as_mut()
                {
                    unrealized_date_state.iterate(
                        price_paid,
                        date_price.unwrap(),
                        split_amount.liquid,
                    );
                }

                if let Some(unrealized_date_state) = one_shot_states_ref
                    .highly_liquid
                    .unrealized_date_state
                    .as_mut()
                {
                    unrealized_date_state.iterate(
                        price_paid,
                        date_price.unwrap(),
                        split_amount.highly_liquid,
                    );
                }
            },
        );

        one_shot_states
    }
}
