use allocative::Allocative;

#[derive(Debug, Default, Allocative)]
pub struct CapitalizationState {
    pub realized_cap_in_cents: u64,
}

impl CapitalizationState {
    pub fn increment(&mut self, realized_cap_in_cents: u64) {
        self.realized_cap_in_cents += realized_cap_in_cents;
    }

    pub fn decrement(&mut self, realized_cap_in_cents: u64) {
        self.realized_cap_in_cents -= realized_cap_in_cents;
    }
}
