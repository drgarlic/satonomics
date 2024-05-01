use std::collections::BTreeMap;

use savefile_derive::Savefile;

use super::BlockPath;

#[derive(Debug, Savefile)]
pub struct TxData {
    pub block_path: BlockPath,
    pub utxos: BTreeMap<u16, u64>,
}

impl TxData {
    pub fn new(block_path: BlockPath, utxos: BTreeMap<u16, u64>) -> Self {
        Self { block_path, utxos }
    }

    #[inline(always)]
    pub fn is_empty(&self) -> bool {
        self.utxos.is_empty()
    }
}
