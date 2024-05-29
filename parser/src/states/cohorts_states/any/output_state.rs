#[derive(Debug, Default)]
pub struct OutputState {
    pub count: f64,
    pub volume: f64,
}

impl OutputState {
    pub fn iterate(&mut self, count: f64, volume: f64) {
        self.count += count;
        self.volume += volume;
    }
}
