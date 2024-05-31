use bitcoin::Amount;

#[derive(Debug, Default)]
pub struct SupplyState {
    pub supply: Amount,
}

impl SupplyState {
    pub fn increment(&mut self, amount: Amount) {
        self.supply += amount;
    }

    pub fn decrement(&mut self, amount: Amount) {
        self.supply -= amount;
    }
}
