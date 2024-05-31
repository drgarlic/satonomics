use bitcoin::Amount;
use derive_deref::{Deref, DerefMut};
use savefile::IsReprC;
use serde::{Deserialize, Serialize};

#[derive(
    Debug,
    PartialEq,
    Eq,
    PartialOrd,
    Ord,
    Clone,
    Copy,
    Deref,
    DerefMut,
    Default,
    Serialize,
    Deserialize,
)]
pub struct WAmount(Amount);

impl WAmount {
    pub fn wrap(amount: Amount) -> Self {
        Self(amount)
    }
}
// impl From<Amount> for WAmount {
//     fn from(amount: Amount) -> Self {
//         WAmount(amount)
//     }
// }

// impl Into<Amount> for WAmount {
//     fn into(self) -> Amount {
//         self.0
//     }
// }

impl savefile::ReprC for WAmount {
    unsafe fn repr_c_optimization_safe(_version: u32) -> savefile::prelude::IsReprC {
        IsReprC::yes()
    }
}

impl savefile::Introspect for WAmount {
    fn introspect_value(&self) -> String {
        self.to_string()
    }

    fn introspect_child(&self, _index: usize) -> Option<Box<dyn savefile::IntrospectItem + '_>> {
        None
    }
}

impl savefile::WithSchema for WAmount {
    fn schema(_: u32) -> savefile::prelude::Schema {
        savefile::Schema::Primitive(savefile::SchemaPrimitive::schema_u64)
    }
}

impl savefile::Serialize for WAmount {
    fn serialize(
        &self,
        serializer: &mut savefile::prelude::Serializer<impl std::io::prelude::Write>,
    ) -> Result<(), savefile::prelude::SavefileError> {
        serializer.write_u64(self.to_sat())
    }
}

impl savefile::Deserialize for WAmount {
    fn deserialize(
        deserializer: &mut savefile::prelude::Deserializer<impl std::io::prelude::Read>,
    ) -> Result<Self, savefile::prelude::SavefileError> {
        let sats = deserializer.read_u64()?;

        Ok(WAmount(Amount::from_sat(sats)))
    }
}

// impl Encode for WAmount {
//     fn encode<E: Encoder>(&self, encoder: &mut E) -> Result<(), EncodeError> {
//         Encode::encode(&self.to_string(), encoder)
//     }
// }

// impl Decode for WAmount {
//     fn decode<D: Decoder>(decoder: &mut D) -> core::result::Result<Self, DecodeError> {
//         let str: String = Decode::decode(decoder)?;

//         Ok(Self(NaiveDate::from_str(&str).unwrap()))
//     }
// }

// impl<'de> BorrowDecode<'de> for WAmount {
//     fn borrow_decode<D: BorrowDecoder<'de>>(decoder: &mut D) -> Result<Self, DecodeError> {
//         let str: String = BorrowDecode::borrow_decode(decoder)?;

//         Ok(Self(NaiveDate::from_str(&str).unwrap()))
//     }
// }
