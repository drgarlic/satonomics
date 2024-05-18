// https://github.com/satonomics-org/explorer/commit/f4ef0ab8397b531b6309d012313d58e00c2a3500?diff=unified&w=0#diff-d6cebd388b8cbacdc37d2925aa13a245dceb9ffd4999d3b5f4278ef27b22d29f

use std::{
    collections::{BTreeMap, BTreeSet},
    fmt::Debug,
    fs,
};

use heed::{EnvOpenOptions, RwTxn};

use super::databases_folder_path;

pub struct Database2<KeyTree, KeyDB, Value, Page>
where
    KeyTree: Ord + Clone + Debug,
    KeyDB: Ord + ?Sized + Storable,
    Value: Copy + Storable + PartialEq,
    Page: BTreeMutPage<KeyDB, Value>,
{
    cached_puts: BTreeMap<KeyTree, Value>,
    cached_dels: BTreeSet<KeyTree>,
    db: heed::Database<KeyDB, Value, Page>,
    wtxn: RwTxn,
    key_tree_to_key_db: fn(&KeyTree) -> &KeyDB,
}

pub const SANAKIRJA_MAX_KEY_SIZE: usize = 510;
const ROOT_DB: usize = 0;
const PAGE_SIZE: u64 = 4096 * 256; // 1mo - Must be a multiplier of 4096

impl<KeyDB, KeyTree, Value, Page> Database2<KeyTree, KeyDB, Value, Page>
where
    KeyTree: Ord + Clone + Debug,
    KeyDB: Ord + ?Sized + Storable,
    Value: Copy + Storable + PartialEq,
    Page: BTreeMutPage<KeyDB, Value>,
{
    pub fn open(
        folder: &str,
        file: &str,
        key_tree_to_key_db: fn(&KeyTree) -> &KeyDB,
    ) -> color_eyre::Result<Self> {
        let path = databases_folder_path(folder);

        fs::create_dir_all(&path)?;

        let env = unsafe { EnvOpenOptions::new().open(format!("{path}/{file}"))? };

        // We open the default unnamed database
        let mut wtxn = env.write_txn()?;

        let db: heed::Database<KeyDB, Value> = env.create_database(&mut wtxn, None)?;

        Ok(Self {
            cached_puts: BTreeMap::default(),
            cached_dels: BTreeSet::default(),
            db,
            wtxn,
            key_tree_to_key_db,
        })
    }

    pub fn get(&self, key: &KeyTree) -> Option<&Value> {
        if let Some(cached_put) = self.get_from_puts(key) {
            return Some(cached_put);
        }

        self.db_get(key)
    }

    #[inline(always)]
    pub fn get_from_puts(&self, key: &KeyTree) -> Option<&Value> {
        self.cached_puts.get(key)
    }

    pub fn take(&mut self, key: &KeyTree) -> Option<Value> {
        if self.cached_dels.get(key).is_none() {
            self.remove_from_puts(key).or_else(|| {
                self.cached_dels.insert(key.clone());

                self.db_get(key).cloned()
            })
        } else {
            dbg!(key);
            panic!("Can't take twice");
        }
    }

    #[inline(always)]
    pub fn remove(&mut self, key: &KeyTree) {
        if self.remove_from_puts(key).is_none() {
            self.cached_dels.insert(key.clone());
        }
    }

    #[inline(always)]
    pub fn remove_from_puts(&mut self, key: &KeyTree) -> Option<Value> {
        self.cached_puts.remove(key)
    }

    #[inline(always)]
    pub fn insert(&mut self, key: KeyTree, value: Value) -> Option<Value> {
        self.cached_dels.remove(&key);
        self.cached_puts.insert(key, value)
    }

    pub fn export(mut self) -> color_eyre::Result<(), Error> {
        if self.cached_dels.is_empty() && self.cached_puts.is_empty() {
            return Ok(());
        }

        self.cached_dels
            .into_iter()
            .try_for_each(|key| -> Result<(), Error> {
                btree::del(
                    &mut self.txn,
                    &mut self.db,
                    (self.key_tree_to_key_db)(&key),
                    None,
                )?;

                Ok(())
            })?;

        self.cached_puts
            .into_iter()
            .try_for_each(|(key, value)| -> Result<(), Error> {
                btree::put(
                    &mut self.txn,
                    &mut self.db,
                    (self.key_tree_to_key_db)(&key),
                    &value,
                )?;

                Ok(())
            })?;

        self.txn.set_root(ROOT_DB, self.db.db.into());

        self.txn.commit()
    }

    fn db_get(&self, key: &KeyTree) -> Option<&Value> {
        let k = (self.key_tree_to_key_db)(key);

        let option = btree::get(&self.txn, &self.db, k, None).unwrap();

        if let Some((k_found, v)) = option {
            if k == k_found {
                return Some(v);
            }
        }

        None
    }
}
