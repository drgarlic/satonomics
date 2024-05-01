use std::{collections::BTreeMap, mem, thread};

use chrono::NaiveDate;

use rayon::prelude::*;

use crate::parse::{
    Address, Database, SizedDatabase, U8x19, U8x31, UnsizedDatabase as _UnsizedDatabase,
};

use super::{AnyDatabaseGroup, Metadata};

type Value = u32;
type U8x19Database = SizedDatabase<U8x19, Value>;
type U8x31Database = SizedDatabase<U8x31, Value>;
type U32Database = SizedDatabase<u32, Value>;
type UnsizedDatabase = _UnsizedDatabase<Box<[u8]>, [u8], Value>;

type P2PKDatabase = U8x19Database;
type P2PKHDatabase = U8x19Database;
type P2SHDatabase = U8x19Database;
type P2WPKHDatabase = U8x19Database;
type P2WSHDatabase = U8x31Database;
type P2TRDatabase = U8x31Database;
type UnknownDatabase = U32Database;
type EmptyDatabase = U32Database;
type MultisigDatabase = UnsizedDatabase;

pub struct AddressToAddressIndex {
    pub metadata: Metadata,

    p2pk: BTreeMap<u16, P2PKDatabase>,
    p2pkh: BTreeMap<u16, P2PKHDatabase>,
    p2sh: BTreeMap<u16, P2SHDatabase>,
    p2wpkh: BTreeMap<u16, P2WPKHDatabase>,
    p2wsh: BTreeMap<u16, P2WSHDatabase>,
    p2tr: BTreeMap<u16, P2TRDatabase>,
    unknown: Option<UnknownDatabase>,
    empty: Option<EmptyDatabase>,
    multisig: Option<MultisigDatabase>,
}

impl AddressToAddressIndex {
    #[allow(unused)]
    pub fn safe_get(&mut self, address: &Address) -> Option<&Value> {
        match address {
            Address::Empty(key) => self.open_empty().get(key),
            Address::Unknown(key) => self.open_unknown().get(key),
            Address::MultiSig(key) => self.open_multisig().get(key),
            Address::P2PK((prefix, rest)) => self.open_p2pk(*prefix).get(rest),
            Address::P2PKH((prefix, rest)) => self.open_p2pkh(*prefix).get(rest),
            Address::P2SH((prefix, rest)) => self.open_p2sh(*prefix).get(rest),
            Address::P2WPKH((prefix, rest)) => self.open_p2wpkh(*prefix).get(rest),
            Address::P2WSH((prefix, rest)) => self.open_p2wsh(*prefix).get(rest),
            Address::P2TR((prefix, rest)) => self.open_p2tr(*prefix).get(rest),
        }
    }

    pub fn open_db(&mut self, address: &Address) {
        match address {
            Address::Empty(_) => {
                self.open_empty();
            }
            Address::Unknown(_) => {
                self.open_unknown();
            }
            Address::MultiSig(_) => {
                self.open_multisig();
            }
            Address::P2PK((prefix, _)) => {
                self.open_p2pk(*prefix);
            }
            Address::P2PKH((prefix, _)) => {
                self.open_p2pkh(*prefix);
            }
            Address::P2SH((prefix, _)) => {
                self.open_p2sh(*prefix);
            }
            Address::P2WPKH((prefix, _)) => {
                self.open_p2wpkh(*prefix);
            }
            Address::P2WSH((prefix, _)) => {
                self.open_p2wsh(*prefix);
            }
            Address::P2TR((prefix, _)) => {
                self.open_p2tr(*prefix);
            }
        }
    }

    /// Doesn't check if the database is open contrary to `safe_get` which does and opens if needed.
    /// Though it makes it easy to use with rayon
    pub fn unsafe_get(&self, address: &Address) -> Option<&Value> {
        match address {
            Address::Empty(key) => self.empty.as_ref().unwrap().get(key),
            Address::Unknown(key) => self.unknown.as_ref().unwrap().get(key),
            Address::MultiSig(key) => self.multisig.as_ref().unwrap().get(key),
            Address::P2PK((prefix, key)) => self.p2pk.get(prefix).unwrap().get(key),
            Address::P2PKH((prefix, key)) => self.p2pkh.get(prefix).unwrap().get(key),
            Address::P2SH((prefix, key)) => self.p2sh.get(prefix).unwrap().get(key),
            Address::P2WPKH((prefix, key)) => self.p2wpkh.get(prefix).unwrap().get(key),
            Address::P2WSH((prefix, key)) => self.p2wsh.get(prefix).unwrap().get(key),
            Address::P2TR((prefix, key)) => self.p2tr.get(prefix).unwrap().get(key),
        }
    }

    pub fn unsafe_get_from_puts(&self, address: &Address) -> Option<&Value> {
        match address {
            Address::Empty(key) => self.empty.as_ref().unwrap().get_from_puts(key),
            Address::Unknown(key) => self.unknown.as_ref().unwrap().get_from_puts(key),
            Address::MultiSig(key) => self.multisig.as_ref().unwrap().get_from_puts(key),
            Address::P2PK((prefix, key)) => self.p2pk.get(prefix).unwrap().get_from_puts(key),
            Address::P2PKH((prefix, key)) => self.p2pkh.get(prefix).unwrap().get_from_puts(key),
            Address::P2SH((prefix, key)) => self.p2sh.get(prefix).unwrap().get_from_puts(key),
            Address::P2WPKH((prefix, key)) => self.p2wpkh.get(prefix).unwrap().get_from_puts(key),
            Address::P2WSH((prefix, key)) => self.p2wsh.get(prefix).unwrap().get_from_puts(key),
            Address::P2TR((prefix, key)) => self.p2tr.get(prefix).unwrap().get_from_puts(key),
        }
    }

    pub fn insert(&mut self, address: Address, value: Value) -> Option<Value> {
        self.metadata.called_insert();

        match address {
            Address::Empty(key) => self.open_empty().insert(key, value),
            Address::Unknown(key) => self.open_unknown().insert(key, value),
            Address::MultiSig(key) => self.open_multisig().insert(key, value),
            Address::P2PK((prefix, rest)) => self.open_p2pk(prefix).insert(rest, value),
            Address::P2PKH((prefix, rest)) => self.open_p2pkh(prefix).insert(rest, value),
            Address::P2SH((prefix, rest)) => self.open_p2sh(prefix).insert(rest, value),
            Address::P2WPKH((prefix, rest)) => self.open_p2wpkh(prefix).insert(rest, value),
            Address::P2WSH((prefix, rest)) => self.open_p2wsh(prefix).insert(rest, value),
            Address::P2TR((prefix, rest)) => self.open_p2tr(prefix).insert(rest, value),
        }
    }

    pub fn open_p2pk(&mut self, prefix: u16) -> &mut P2PKDatabase {
        self.p2pk.entry(prefix).or_insert_with(|| {
            Database::open(
                &format!("{}/{}", Self::folder(), "p2pk"),
                &prefix.to_string(),
                |key| key,
            )
            .unwrap()
        })
    }

    pub fn open_p2pkh(&mut self, prefix: u16) -> &mut P2PKHDatabase {
        self.p2pkh.entry(prefix).or_insert_with(|| {
            Database::open(
                &format!("{}/{}", Self::folder(), "p2pkh"),
                &prefix.to_string(),
                |key| key,
            )
            .unwrap()
        })
    }

    pub fn open_p2sh(&mut self, prefix: u16) -> &mut P2SHDatabase {
        self.p2sh.entry(prefix).or_insert_with(|| {
            Database::open(
                &format!("{}/{}", Self::folder(), "p2sh"),
                &prefix.to_string(),
                |key| key,
            )
            .unwrap()
        })
    }

    pub fn open_p2wpkh(&mut self, prefix: u16) -> &mut P2WPKHDatabase {
        self.p2wpkh.entry(prefix).or_insert_with(|| {
            Database::open(
                &format!("{}/{}", Self::folder(), "p2wpkh"),
                &prefix.to_string(),
                |key| key,
            )
            .unwrap()
        })
    }

    pub fn open_p2wsh(&mut self, prefix: u16) -> &mut P2WSHDatabase {
        self.p2wsh.entry(prefix).or_insert_with(|| {
            Database::open(
                &format!("{}/{}", Self::folder(), "p2wsh"),
                &prefix.to_string(),
                |key| key,
            )
            .unwrap()
        })
    }

    pub fn open_p2tr(&mut self, prefix: u16) -> &mut P2TRDatabase {
        self.p2tr.entry(prefix).or_insert_with(|| {
            Database::open(
                &format!("{}/{}", Self::folder(), "p2tr"),
                &prefix.to_string(),
                |key| key,
            )
            .unwrap()
        })
    }

    pub fn open_unknown(&mut self) -> &mut UnknownDatabase {
        self.unknown
            .get_or_insert_with(|| Database::open(Self::folder(), "unknown", |key| key).unwrap())
    }

    pub fn open_empty(&mut self) -> &mut UnknownDatabase {
        self.empty
            .get_or_insert_with(|| Database::open(Self::folder(), "empty", |key| key).unwrap())
    }

    pub fn open_multisig(&mut self) -> &mut MultisigDatabase {
        self.multisig.get_or_insert_with(|| {
            Database::open(Self::folder(), "multisig", |key| key as &[u8]).unwrap()
        })
    }
}

impl AnyDatabaseGroup for AddressToAddressIndex {
    fn import() -> Self {
        Self {
            p2pk: BTreeMap::default(),
            p2pkh: BTreeMap::default(),
            p2sh: BTreeMap::default(),
            p2wpkh: BTreeMap::default(),
            p2wsh: BTreeMap::default(),
            p2tr: BTreeMap::default(),
            unknown: None,
            empty: None,
            multisig: None,
            metadata: Metadata::import(&Self::full_path()),
        }
    }

    fn export(&mut self, height: usize, date: NaiveDate) -> color_eyre::Result<()> {
        thread::scope(|s| {
            s.spawn(|| {
                mem::take(&mut self.p2pk)
                    .into_par_iter()
                    .try_for_each(|(_, db)| db.export())
            });
            s.spawn(|| {
                mem::take(&mut self.p2pkh)
                    .into_par_iter()
                    .try_for_each(|(_, db)| db.export())
            });
            s.spawn(|| {
                mem::take(&mut self.p2sh)
                    .into_par_iter()
                    .try_for_each(|(_, db)| db.export())
            });
            s.spawn(|| {
                mem::take(&mut self.p2wpkh)
                    .into_par_iter()
                    .try_for_each(|(_, db)| db.export())
            });
            s.spawn(|| {
                mem::take(&mut self.p2wsh)
                    .into_par_iter()
                    .try_for_each(|(_, db)| db.export())
            });
            s.spawn(|| {
                mem::take(&mut self.p2tr)
                    .into_par_iter()
                    .try_for_each(|(_, db)| db.export())
            });

            s.spawn(|| self.unknown.take().map(|db| db.export()));
            s.spawn(|| self.empty.take().map(|db| db.export()));
            s.spawn(|| self.multisig.take().map(|db| db.export()));
        });

        self.metadata.export(height, date)?;

        Ok(())
    }

    fn reset_metadata(&mut self) {
        self.metadata.reset()
    }

    fn folder<'a>() -> &'a str {
        "address_to_address_index"
    }
}
