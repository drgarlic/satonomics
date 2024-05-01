use crate::parse::AddressData;

use super::AnyState;

use derive_deref::{Deref, DerefMut};
use nohash::IntMap;
use savefile_derive::Savefile;

#[derive(Default, Deref, DerefMut, Debug, Savefile)]
pub struct AddressIndexToAddressData(IntMap<u32, AddressData>);

impl AnyState for AddressIndexToAddressData {
    fn name<'a>() -> &'a str {
        "address_index_to_address_data"
    }

    fn clear(&mut self) {
        self.0.clear();
    }
}
