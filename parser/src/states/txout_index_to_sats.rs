use derive_deref::{Deref, DerefMut};
use nohash::IntMap;
use savefile_derive::Savefile;

use crate::parse::TxoutIndex;

use super::AnyState;

#[derive(Default, Deref, DerefMut, Debug, Savefile)]
pub struct TxoutIndexToSats(IntMap<TxoutIndex, u64>);

impl AnyState for TxoutIndexToSats {
    fn name<'a>() -> &'a str {
        "txout_index_to_sats"
    }

    fn clear(&mut self) {
        self.0.clear();
    }
}
