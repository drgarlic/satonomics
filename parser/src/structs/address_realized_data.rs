use super::{AddressData, Price, WAmount};

#[derive(Debug)]
pub struct AddressRealizedData {
    pub initial_address_data: AddressData,
    pub received: WAmount,
    pub sent: WAmount,
    pub profit: Price,
    pub loss: Price,
    pub utxos_created: u32,
    pub utxos_destroyed: u32,
}

impl AddressRealizedData {
    pub fn default(initial_address_data: &AddressData) -> Self {
        Self {
            received: WAmount::ZERO,
            sent: WAmount::ZERO,
            profit: Price::ZERO,
            loss: Price::ZERO,
            utxos_created: 0,
            utxos_destroyed: 0,
            initial_address_data: *initial_address_data,
        }
    }

    pub fn receive(&mut self, amount: WAmount) {
        self.received += amount;
        self.utxos_created += 1;
    }

    pub fn send(&mut self, amount: WAmount, realized_profit_or_loss: f64) {
        self.sent += amount;

        self.utxos_destroyed += 1;

        if realized_profit_or_loss >= 0.0 {
            self.profit += Price::from_dollar(realized_profit_or_loss);
        } else {
            self.loss += Price::from_dollar(realized_profit_or_loss.abs());
        }
    }
}
