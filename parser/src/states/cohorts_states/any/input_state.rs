#[derive(Debug, Default)]
pub struct InputState {
    pub count: f64,
    pub volume: f64,
}

impl InputState {
    pub fn iterate(&mut self, count: f64, volume: f64) {
        self.count += count;
        self.volume += volume;
    }
}
