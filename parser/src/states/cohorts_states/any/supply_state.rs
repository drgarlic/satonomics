use bitcoin::Amount;
use color_eyre::eyre::eyre;

#[derive(Debug, Default)]
pub struct SupplyState {
    pub supply: Amount,
}

impl SupplyState {
    pub fn increment(&mut self, amount: Amount) {
        self.supply += amount;
    }

    pub fn decrement(&mut self, amount: Amount) -> color_eyre::Result<()> {
        if self.supply < amount {
            dbg!(self.supply, amount);

            return Err(eyre!("supply smaller than supply"));
        }

        self.supply -= amount;

        Ok(())
    }
}
