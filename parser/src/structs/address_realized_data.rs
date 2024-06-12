use bitcoin::Amount;

use super::AddressData;

#[derive(Debug)]
pub struct AddressRealizedData {
    pub initial_address_data: AddressData,
    pub received: Amount,
    pub sent: Amount,
    pub profit: f32,
    pub loss: f32,
    pub utxos_created: u32,
    pub utxos_destroyed: u32,
}

impl AddressRealizedData {
    pub fn default(initial_address_data: &AddressData) -> Self {
        Self {
            received: Amount::ZERO,
            sent: Amount::ZERO,
            profit: 0.0,
            loss: 0.0,
            utxos_created: 0,
            utxos_destroyed: 0,
            initial_address_data: *initial_address_data,
        }
    }

    pub fn receive(&mut self, amount: Amount) {
        self.received += amount;
        self.utxos_created += 1;
    }

    pub fn send(&mut self, amount: Amount, realized_profit_or_loss: f32) {
        self.sent += amount;
        self.utxos_destroyed += 1;

        if realized_profit_or_loss >= 0.0 {
            self.profit += realized_profit_or_loss;
        } else {
            self.loss += realized_profit_or_loss.abs();
        }
    }
}
