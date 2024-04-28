use std::collections::BTreeMap;

use chrono::{NaiveDateTime, NaiveTime, TimeZone, Timelike, Utc};
use color_eyre::eyre::Error;

use crate::{
    datasets::{AnyDataset, MinInitialState},
    parse::{AnyHeightMap, HeightMap},
    price::{Binance, Kraken},
    utils::ONE_MINUTE_IN_MS,
};

use super::OHLC;

pub struct HeightDataset {
    min_initial_state: MinInitialState,

    kraken_1mn: Option<BTreeMap<u32, OHLC>>,
    binance_1mn: Option<BTreeMap<u32, OHLC>>,
    binance_har: Option<BTreeMap<u32, OHLC>>,

    pub map: HeightMap<OHLC>,
}

impl HeightDataset {
    pub fn import(parent_path: &str) -> color_eyre::Result<Self> {
        let mut s = Self {
            min_initial_state: MinInitialState::default(),

            binance_1mn: None,
            binance_har: None,
            kraken_1mn: None,

            map: HeightMap::_new_json(1, parent_path, usize::MAX, false),
        };

        s.min_initial_state
            .consume(MinInitialState::compute_from_dataset(&s));

        Ok(s)
    }

    pub fn get(
        &mut self,
        height: usize,
        timestamp: u32,
        previous_timestamp: Option<u32>,
    ) -> color_eyre::Result<OHLC> {
        if let Some(ohlc) = self.map.get(&height) {
            return Ok(ohlc);
        }

        let clean_timestamp = |timestamp| {
            let date_time = Utc.timestamp_opt(i64::from(timestamp), 0).unwrap();

            NaiveDateTime::new(
                date_time.date_naive(),
                NaiveTime::from_hms_opt(date_time.hour(), date_time.minute(), 0).unwrap(),
            )
            .and_utc()
            .timestamp() as u32
        };

        let timestamp = clean_timestamp(timestamp);

        if previous_timestamp.is_none() || height > 0 {
            panic!("Shouldn't be possible");
        }

        let previous_timestamp = previous_timestamp.map(clean_timestamp);

        let ohlc = self.get_from_1mn_kraken(timestamp, previous_timestamp).unwrap_or_else(|_| {
                self.get_from_1mn_binance(timestamp, previous_timestamp)
                    .unwrap_or_else(|_| self.get_from_har_binance(timestamp, previous_timestamp).unwrap_or_else(|_| {
                        panic!(
                            "Can't find price for {height} - {timestamp}, please update binance.har file"
                        )
                    }))
            });

        self.map.insert(height, ohlc);

        Ok(ohlc)
    }

    fn get_from_1mn_kraken(
        &mut self,
        timestamp: u32,
        previous_timestamp: Option<u32>,
    ) -> color_eyre::Result<OHLC> {
        if self.kraken_1mn.is_none() {
            self.kraken_1mn.replace(Kraken::fetch_1mn_prices()?);
        }

        Self::get_ohlc(&self.kraken_1mn, timestamp, previous_timestamp, "kraken 1m")
    }

    fn get_from_1mn_binance(
        &mut self,
        timestamp: u32,
        previous_timestamp: Option<u32>,
    ) -> color_eyre::Result<OHLC> {
        if self.binance_1mn.is_none() {
            self.binance_1mn.replace(Binance::fetch_1mn_prices()?);
        }

        Self::get_ohlc(
            &self.binance_1mn,
            timestamp,
            previous_timestamp,
            "binance 1m",
        )
    }

    fn get_from_har_binance(
        &mut self,
        timestamp: u32,
        previous_timestamp: Option<u32>,
    ) -> color_eyre::Result<OHLC> {
        if self.binance_har.is_none() {
            self.binance_har.replace(Binance::read_har_file()?);
        }

        Self::get_ohlc(
            &self.binance_har,
            timestamp,
            previous_timestamp,
            "binance har",
        )
    }

    fn get_ohlc(
        tree: &Option<BTreeMap<u32, OHLC>>,
        timestamp: u32,
        previous_timestamp: Option<u32>,
        name: &str,
    ) -> color_eyre::Result<OHLC> {
        let tree = tree.as_ref().unwrap();

        let err = Error::msg(format!("Couldn't find timestamp in {name}"));

        let previous_ohlc = previous_timestamp
            .map_or(Some(OHLC::default()), |previous_timestamp| {
                tree.get(&previous_timestamp).cloned()
            });

        let mut first_timestamp = 0;

        let first_ohlc = previous_timestamp.map_or(Some(OHLC::default()), |previous_timestamp| {
            first_timestamp = previous_timestamp + ONE_MINUTE_IN_MS as u32;

            tree.get(&first_timestamp).cloned()
        });

        let last_ohlc = tree.get(&timestamp);

        if previous_ohlc.is_none() || first_ohlc.is_none() || last_ohlc.is_none() {
            return Err(err);
        }

        let mut final_ohlc = first_ohlc.unwrap();
        final_ohlc.open = last_ohlc.unwrap().close;

        tree.range(&first_timestamp..=&timestamp)
            .for_each(|(_, ohlc)| {
                if ohlc.high > final_ohlc.high {
                    final_ohlc.high = ohlc.high
                }

                if ohlc.low < final_ohlc.low {
                    final_ohlc.low = ohlc.low
                }
            });

        Ok(final_ohlc)
    }
}

impl AnyDataset for HeightDataset {
    fn get_min_initial_state(&self) -> &MinInitialState {
        &self.min_initial_state
    }

    fn to_any_height_map_vec(&self) -> Vec<&(dyn AnyHeightMap + Send + Sync)> {
        vec![&self.map]
    }

    fn to_any_mut_height_map_vec(&mut self) -> Vec<&mut dyn AnyHeightMap> {
        vec![&mut self.map]
    }
}
