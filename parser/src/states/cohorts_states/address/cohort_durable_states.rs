use bitcoin::Amount;

use crate::{
    states::DurableStates,
    structs::{LiquiditySplitResult, SplitByLiquidity},
};

#[derive(Default, Debug)]
pub struct AddressCohortDurableStates {
    pub address_count: usize,
    pub split: SplitByLiquidity<DurableStates>,
}

const ONE_THIRD: f64 = 0.33333333333;

impl AddressCohortDurableStates {
    // TODO: Merge increment and decrement and add a flag to know which, same code

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
        split_amount: &LiquiditySplitResult,
        split_utxo_count: &LiquiditySplitResult,
        increment: bool,
    ) -> color_eyre::Result<()> {
        if increment {
            self.split
                .all
                .increment(amount, utxo_count, mean_cents_paid)
        } else {
            self.split
                .all
                .decrement(amount, utxo_count, mean_cents_paid)
        }
        .inspect_err(|report| {
            dbg!(report, "split all failed", split_amount, split_utxo_count);
        })?;

        let illiquid_amount = split_amount.illiquid.trunc();
        let illiquid_amount_rest = split_amount.illiquid - illiquid_amount;
        let mut illiquid_amount = Amount::from_sat(illiquid_amount as u64);
        let mut illiquid_utxo_count = split_utxo_count.illiquid.trunc() as usize;
        let illiquid_utxo_count_rest = split_utxo_count.illiquid.fract();

        let liquid_amount = split_amount.liquid.trunc();
        let liquid_amount_rest = split_amount.liquid - liquid_amount;
        let mut liquid_amount = Amount::from_sat(liquid_amount as u64);
        let mut liquid_utxo_count = split_utxo_count.liquid.trunc() as usize;
        let liquid_utxo_count_rest = split_utxo_count.liquid.fract();

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

        if increment {
            self.split
                .illiquid
                .increment(illiquid_amount, illiquid_utxo_count, mean_cents_paid)
        } else {
            self.split
                .illiquid
                .decrement(illiquid_amount, illiquid_utxo_count, mean_cents_paid)
        }
        .inspect_err(|report| {
            dbg!(
                report,
                "split illiquid failed",
                split_amount,
                split_utxo_count
            );
        })?;

        if increment {
            self.split
                .liquid
                .increment(liquid_amount, liquid_utxo_count, mean_cents_paid)
        } else {
            self.split
                .liquid
                .decrement(liquid_amount, liquid_utxo_count, mean_cents_paid)
        }
        .inspect_err(|report| {
            dbg!(
                report,
                "split liquid failed",
                split_amount,
                split_utxo_count
            );
        })?;

        if increment {
            self.split.highly_liquid.increment(
                highly_liquid_amount,
                highly_liquid_utxo_count,
                mean_cents_paid,
            )
        } else {
            self.split.highly_liquid.decrement(
                highly_liquid_amount,
                highly_liquid_utxo_count,
                mean_cents_paid,
            )
        }
        .inspect_err(|report| {
            dbg!(
                report,
                "split highly liquid failed",
                split_amount,
                split_utxo_count
            );
        })?;

        Ok(())
    }
}
