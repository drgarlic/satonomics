use super::{AddressSize, AddressType};

#[derive(Default)]
pub enum AddressSplit {
    #[default]
    All,
    Type(AddressType),
    Size(AddressSize),
}
