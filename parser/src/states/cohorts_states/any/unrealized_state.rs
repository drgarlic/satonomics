use std::ops::Add;

use bitcoin::Amount;

#[derive(Debug, Default)]
pub struct UnrealizedState {
    pub supply_in_profit: Amount,
    pub unrealized_profit: f32,
    pub unrealized_loss: f32,
}

impl UnrealizedState {
    #[inline]
    pub fn iterate(&mut self, price_then: f32, price_now: f32, amount: Amount) {
        let amount_in_btc = amount.to_btc() as f32;

        if price_then < price_now {
            self.unrealized_profit += amount_in_btc * (price_now - price_then);
            self.supply_in_profit += amount;
        } else if price_then > price_now {
            self.unrealized_loss += amount_in_btc * (price_then - price_now);
        }
    }
}

impl Add<UnrealizedState> for UnrealizedState {
    type Output = UnrealizedState;

    fn add(self, other: UnrealizedState) -> UnrealizedState {
        UnrealizedState {
            supply_in_profit: self.supply_in_profit + other.supply_in_profit,
            unrealized_profit: self.unrealized_profit + other.unrealized_profit,
            unrealized_loss: self.unrealized_loss + other.unrealized_loss,
        }
    }
}
