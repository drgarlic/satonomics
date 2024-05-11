use std::{
    collections::BTreeMap,
    mem,
    ops::{Deref, DerefMut},
};

use chrono::NaiveDate;

use rayon::prelude::*;

use crate::structs::{AddressData, SizedDatabase};

use super::{AnyDatabaseGroup, Metadata};

type Key = u32;
type Value = AddressData;
type Database = SizedDatabase<Key, Value>;

pub struct AddressIndexToAddressData {
    map: BTreeMap<usize, Database>,
    pub metadata: Metadata,
}

impl Deref for AddressIndexToAddressData {
    type Target = BTreeMap<usize, Database>;

    fn deref(&self) -> &Self::Target {
        &self.map
    }
}

impl DerefMut for AddressIndexToAddressData {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.map
    }
}

const DB_MAX_SIZE: usize = 10_000_000;

impl AddressIndexToAddressData {
    pub fn insert(&mut self, key: Key, value: Value) -> Option<Value> {
        self.metadata.called_insert();

        self.open_db(&key).insert(key, value)
    }

    pub fn undo_insert(&mut self, key: &Key) -> Option<Value> {
        self.metadata.called_remove();

        self.open_db(key).remove_from_puts(key)
    }

    pub fn remove(&mut self, key: &Key) {
        self.metadata.called_remove();

        self.open_db(key).remove(key)
    }

    /// Doesn't check if the database is open contrary to `safe_get` which does and opens if needed
    /// Though it makes it easy to use with rayon.
    pub fn unsafe_get(&self, key: &Key) -> Option<&Value> {
        let db_index = Self::db_index(key);

        self.get(&db_index).unwrap().get(key)
    }

    pub fn open_db(&mut self, key: &Key) -> &mut Database {
        let db_index = Self::db_index(key);

        self.entry(db_index).or_insert_with(|| {
            let db_name = format!(
                "{}..{}",
                db_index * DB_MAX_SIZE,
                (db_index + 1) * DB_MAX_SIZE
            );

            SizedDatabase::open(Self::folder(), &db_name, |key| key).unwrap()
        })
    }

    fn db_index(key: &Key) -> usize {
        *key as usize / DB_MAX_SIZE
    }
}

impl AnyDatabaseGroup for AddressIndexToAddressData {
    fn import() -> Self {
        Self {
            map: BTreeMap::default(),
            metadata: Metadata::import(&Self::full_path()),
        }
    }

    fn export(&mut self, height: usize, date: NaiveDate) -> color_eyre::Result<()> {
        mem::take(&mut self.map)
            .into_par_iter()
            .try_for_each(|(_, db)| db.export())?;

        self.metadata.export(height, date)?;

        Ok(())
    }

    fn reset_metadata(&mut self) {
        self.metadata.reset();
    }

    fn folder<'a>() -> &'a str {
        "address_index_to_address_data"
    }
}
