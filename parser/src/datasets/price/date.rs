use std::collections::BTreeMap;

use chrono::NaiveDate;
use color_eyre::eyre::Error;

use crate::{
    datasets::{AnyDataset, MinInitialState},
    parse::{AnyDateMap, DateMap},
    price::{Binance, Kraken},
};

use super::OHLC;

pub struct DateDataset {
    min_initial_state: MinInitialState,

    kraken_daily: Option<BTreeMap<NaiveDate, OHLC>>,

    pub closes: DateMap<OHLC>,
}

impl DateDataset {
    pub fn import(parent_path: &str) -> color_eyre::Result<Self> {
        let mut s = Self {
            min_initial_state: MinInitialState::default(),

            kraken_daily: None,

            closes: DateMap::_new_json(1, parent_path, usize::MAX, true),
        };

        s.min_initial_state
            .consume(MinInitialState::compute_from_dataset(&s));

        Ok(s)
    }

    pub fn get(&mut self, date: NaiveDate) -> color_eyre::Result<OHLC> {
        if self.closes.is_date_safe(date) {
            Ok(self.closes.get(date).unwrap().to_owned())
        } else {
            let ohlc = self.get_from_daily_kraken(&date)?;

            self.closes.insert(date, ohlc);

            Ok(ohlc)
        }
    }

    fn get_from_daily_kraken(&mut self, date: &NaiveDate) -> color_eyre::Result<OHLC> {
        if self.kraken_daily.is_none() {
            self.kraken_daily.replace(
                Kraken::fetch_daily_prices()
                    .unwrap_or_else(|_| Binance::fetch_daily_prices().unwrap()),
            );
        }

        self.kraken_daily
            .as_ref()
            .unwrap()
            .get(date)
            .cloned()
            .ok_or(Error::msg("Couldn't find date in daily kraken"))
    }
}

impl AnyDataset for DateDataset {
    fn get_min_initial_state(&self) -> &MinInitialState {
        &self.min_initial_state
    }

    fn to_any_date_map_vec(&self) -> Vec<&(dyn AnyDateMap + Send + Sync)> {
        vec![&self.closes]
    }

    fn to_any_mut_date_map_vec(&mut self) -> Vec<&mut dyn AnyDateMap> {
        vec![&mut self.closes]
    }

    fn export(&self) -> color_eyre::Result<()> {
        self.to_any_map_vec()
            .into_iter()
            .try_for_each(|map| -> color_eyre::Result<()> { map.export() })
    }
}
