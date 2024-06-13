use std::{
    collections::BTreeMap,
    fmt::Debug,
    ops::{AddAssign, SubAssign},
};

use bitcoin::Amount;
use color_eyre::eyre::eyre;
use derive_deref::{Deref, DerefMut};

use crate::structs::SplitByLiquidity;

pub trait CanSubtract {
    fn can_subtract(&self, other: &Self) -> bool;
}

impl CanSubtract for Amount {
    fn can_subtract(&self, other: &Self) -> bool {
        self >= other
    }
}

impl CanSubtract for SplitByLiquidity<Amount> {
    fn can_subtract(&self, other: &Self) -> bool {
        self.all >= other.all
            && self.illiquid >= other.illiquid
            && self.liquid >= other.liquid
            && self.highly_liquid >= other.highly_liquid
    }
}

pub trait IsZero {
    fn is_zero(&self) -> color_eyre::Result<bool>;
}

impl IsZero for Amount {
    fn is_zero(&self) -> color_eyre::Result<bool> {
        Ok(*self == Amount::ZERO)
    }
}

impl IsZero for SplitByLiquidity<Amount> {
    fn is_zero(&self) -> color_eyre::Result<bool> {
        if self.all == Amount::ZERO
            && (self.illiquid != Amount::ZERO
                || self.liquid != Amount::ZERO
                || self.highly_liquid != Amount::ZERO)
        {
            dbg!(&self);
            Err(eyre!("Bad split"))
        } else {
            Ok(self.all == Amount::ZERO)
        }
    }
}

#[derive(Deref, DerefMut, Default, Debug)]
pub struct PriceInCentsToValue<T>(BTreeMap<u32, T>);

impl<T> PriceInCentsToValue<T>
where
    T: Default
        + Debug
        + AddAssign
        + SubAssign
        + CanSubtract
        + Default
        + Copy
        + Clone
        + PartialEq
        + IsZero,
{
    pub fn increment(&mut self, cents: u32, value: T) {
        *self.entry(cents).or_default() += value;
    }

    pub fn decrement(&mut self, cents: u32, value: T) -> color_eyre::Result<()> {
        let delete = {
            let self_value = self.get_mut(&cents);

            if self_value.is_none() {
                dbg!(&self.0, cents, value);
                return Err(eyre!("self_value is none"));
            }

            let self_value = self_value.unwrap();

            if !self_value.can_subtract(&value) {
                dbg!(*self_value, &self.0, cents, value);
                return Err(eyre!("self value < value"));
            }

            *self_value -= value;

            self_value.is_zero()?
        };

        if delete {
            self.remove(&cents).unwrap();
        }

        Ok(())
    }

    pub fn iterate(&self, supply: T, mut iterate: impl FnMut(f32, T)) {
        // let mut one_shot_states = OneShotStates::default();

        // if date_price.is_some() {
        //     one_shot_states
        //         .unrealized_date_state
        //         .replace(UnrealizedState::default());
        // }

        let mut processed = T::default();

        self.iter().for_each(|(cents, value)| {
            let value = *value;

            processed += value;

            let mean_price_paid = ((*cents as f64) / 100.0) as f32;

            iterate(mean_price_paid, value)

            // one_shot_states
            //     .price_paid_state
            //     .iterate(mean_price_paid, amount, supply);

            // one_shot_states
            //     .unrealized_block_state
            //     .iterate(mean_price_paid, block_price, amount);

            // if let Some(unrealized_date_state) = one_shot_states.unrealized_date_state.as_mut() {
            //     unrealized_date_state.iterate(mean_price_paid, date_price.unwrap(), amount);
            // }
        });

        if processed != supply {
            dbg!(processed, supply);
            panic!("processed_amount isn't equal to supply")
        }

        // one_shot_states
    }
}
