use savefile_derive::Savefile;

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Clone, Copy, Savefile)]
pub struct TxoutIndex {
    pub tx_index: u32,
    pub vout: u16,
}

impl TxoutIndex {
    pub fn new(tx_index: u32, vout: u16) -> Self {
        Self { tx_index, vout }
    }
}

impl std::hash::Hash for TxoutIndex {
    fn hash<H: std::hash::Hasher>(&self, hasher: &mut H) {
        hasher.write_u64(((self.tx_index as u64) << 16_u64) + self.vout as u64)
    }
}

impl nohash::IsEnabled for TxoutIndex {}
