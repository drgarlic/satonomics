use std::f64::EPSILON;

use bitcoin::Amount;

pub struct LiquidityClassification {
    illiquid: f64,
    liquid: f64,
    highly_liquid: f64,
}

impl LiquidityClassification {
    /// Following this:
    /// https://insights.glassnode.com/bitcoin-liquid-supply/
    /// https://www.desmos.com/calculator/dutgni5rtj
    pub fn new(sent: Amount, received: Amount) -> Self {
        if received == Amount::ZERO {
            dbg!(sent, received);
            panic!()
        }

        let liquidity = {
            if sent > received {
                panic!("Shouldn't be possible");
            }

            if sent == Amount::ZERO {
                0.0
            } else {
                let liquidity = sent.to_btc() / received.to_btc();

                if liquidity.is_nan() {
                    dbg!(sent, received);
                    unreachable!()
                } else {
                    liquidity
                }
            }
        };

        let illiquid = Self::compute_illiquid(liquidity);
        let liquid = Self::compute_liquid(liquidity);

        Self {
            illiquid,
            liquid,
            highly_liquid: 1.0 - liquid - illiquid,
        }
    }

    #[inline(always)]
    pub fn split(&self, value: f64) -> LiquiditySplitResult {
        LiquiditySplitResult {
            all: value,
            illiquid: value * self.illiquid,
            liquid: value * self.liquid,
            highly_liquid: value * self.highly_liquid,
        }
    }

    /// Returns value in range 0.0..1.0
    #[inline(always)]
    fn compute_illiquid(x: f64) -> f64 {
        Self::compute_ratio(x, 0.25)
    }

    /// Returns value in range 0.0..1.0
    #[inline(always)]
    fn compute_liquid(x: f64) -> f64 {
        Self::compute_ratio(x, 0.75)
    }

    #[inline(always)]
    fn compute_ratio(x: f64, x0: f64) -> f64 {
        let l = 1.0;
        let k = 25.0;

        l / (1.0 + EPSILON.powf(k * (x - x0)))
    }
}

#[derive(Debug, Default)]
pub struct LiquiditySplitResult {
    pub all: f64,
    pub illiquid: f64,
    pub liquid: f64,
    pub highly_liquid: f64,
}

#[derive(Debug, Default)]
pub struct SplitByLiquidity<T>
where
    T: Default,
{
    pub all: T,
    pub illiquid: T,
    pub liquid: T,
    pub highly_liquid: T,
}

impl<T> SplitByLiquidity<T>
where
    T: Default,
{
    // pub fn get(&self, id: &LiquidityId) -> &T {
    //     match id {
    //         LiquidityId::All => &self.all,
    //         LiquidityId::Illiquid => &self.illiquid,
    //         LiquidityId::Liquid => &self.liquid,
    //         LiquidityId::HighlyLiquid => &self.highly_liquid,
    //     }
    // }

    pub fn get_mut(&mut self, id: &LiquidityId) -> &mut T {
        match id {
            LiquidityId::All => &mut self.all,
            LiquidityId::Illiquid => &mut self.illiquid,
            LiquidityId::Liquid => &mut self.liquid,
            LiquidityId::HighlyLiquid => &mut self.highly_liquid,
        }
    }

    pub fn as_vec(&self) -> Vec<(&T, LiquidityId)> {
        vec![
            (&self.all, LiquidityId::All),
            (&self.illiquid, LiquidityId::Illiquid),
            (&self.liquid, LiquidityId::Liquid),
            (&self.highly_liquid, LiquidityId::HighlyLiquid),
        ]
    }
}

#[derive(Debug, Clone, Copy)]
pub enum LiquidityId {
    All,
    Illiquid,
    Liquid,
    HighlyLiquid,
}
