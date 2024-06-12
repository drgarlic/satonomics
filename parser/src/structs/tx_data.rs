use sanakirja::{direct_repr, Storable, UnsizedStorable};

use super::BlockPath;

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Clone)]
pub struct TxData {
    pub index: u32,
    pub block_path: BlockPath,
    pub utxos: u16,
}
direct_repr!(TxData);

impl TxData {
    pub fn new(index: u32, block_path: BlockPath, utxos: u16) -> Self {
        Self {
            index,
            block_path,
            utxos,
        }
    }

    #[inline(always)]
    pub fn is_empty(&self) -> bool {
        self.utxos == 0
    }
}
