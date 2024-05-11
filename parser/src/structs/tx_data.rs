use sanakirja::{direct_repr, Storable, UnsizedStorable};
use savefile_derive::Savefile;

use super::BlockPath;

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Clone, Copy, Savefile)]
pub struct TxData {
    pub block_path: BlockPath,
    pub utxos: u16,
}
direct_repr!(TxData);

impl TxData {
    pub fn new(block_path: BlockPath, utxos: u16) -> Self {
        Self { block_path, utxos }
    }

    #[inline(always)]
    pub fn is_empty(&self) -> bool {
        self.utxos == 0
    }
}
