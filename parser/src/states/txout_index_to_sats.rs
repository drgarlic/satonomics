use std::collections::BTreeMap;

use derive_deref::{Deref, DerefMut};

use savefile_derive::Savefile;

use crate::structs::{TxoutIndex, WAmount};

use super::AnyState;

#[derive(Default, Deref, DerefMut, Debug, Savefile)]
pub struct TxoutIndexToAmount(BTreeMap<TxoutIndex, WAmount>);

impl AnyState for TxoutIndexToAmount {
    fn name<'a>() -> &'a str {
        "txout_index_to_amount"
    }

    fn clear(&mut self) {
        self.0.clear();
    }
}
