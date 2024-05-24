use std::collections::BTreeMap;

use chrono::{NaiveDateTime, NaiveTime, TimeZone, Timelike, Utc};
use color_eyre::eyre::Error;

use crate::{
    datasets::{AnyDataset, ComputeData, MinInitialStates},
    price::{Binance, Kraken},
    structs::{AnyHeightMap, HeightMap},
};

use super::OHLC;

pub struct HeightDataset {
    min_initial_states: MinInitialStates,

    kraken_1mn: Option<BTreeMap<u32, OHLC>>,
    binance_1mn: Option<BTreeMap<u32, OHLC>>,
    binance_har: Option<BTreeMap<u32, OHLC>>,

    // Inserted
    pub ohlcs: HeightMap<OHLC>,

    // Computed
    pub closes: HeightMap<f32>,
}

impl HeightDataset {
    pub fn import(price_path: &str, dataset_path: &str) -> color_eyre::Result<Self> {
        let mut s = Self {
            min_initial_states: MinInitialStates::default(),

            binance_1mn: None,
            binance_har: None,
            kraken_1mn: None,

            ohlcs: HeightMap::_new_json(1, &format!("{price_path}/ohlc"), usize::MAX, false),
            closes: HeightMap::_new_json(1, &format!("{dataset_path}/close"), usize::MAX, false),
        };

        s.min_initial_states
            .consume(MinInitialStates::compute_from_dataset(&s));

        Ok(s)
    }

    pub fn get(
        &mut self,
        height: usize,
        timestamp: u32,
        previous_timestamp: Option<u32>,
    ) -> color_eyre::Result<OHLC> {
        if let Some(ohlc) = self.ohlcs.get(&height) {
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

        if previous_timestamp.is_none() && height > 0 {
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

        self.ohlcs.insert(height, ohlc);

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

        let last_ohlc = tree.get(&timestamp);

        if previous_ohlc.is_none() || last_ohlc.is_none() {
            return Err(err);
        }

        let previous_ohlc = previous_ohlc.unwrap();

        let mut final_ohlc = OHLC {
            open: previous_ohlc.close,
            high: previous_ohlc.close,
            low: previous_ohlc.close,
            close: previous_ohlc.close,
        };

        let start = previous_timestamp.unwrap_or(0);
        let end = timestamp;

        // Otherwise it's a re-org
        if start < end {
            tree.range(&start..=&end).skip(1).for_each(|(_, ohlc)| {
                if ohlc.high > final_ohlc.high {
                    final_ohlc.high = ohlc.high
                }

                if ohlc.low < final_ohlc.low {
                    final_ohlc.low = ohlc.low
                }

                final_ohlc.close = ohlc.close;
            });
        }

        Ok(final_ohlc)
    }

    pub fn compute(&mut self, &ComputeData { heights, .. }: &ComputeData) {
        self.closes
            .multiple_insert_simple_transform(heights, &mut self.ohlcs, |ohlc| ohlc.close);
    }
}

impl AnyDataset for HeightDataset {
    fn get_min_initial_states(&self) -> &MinInitialStates {
        &self.min_initial_states
    }

    fn to_inserted_height_map_vec(&self) -> Vec<&(dyn AnyHeightMap + Send + Sync)> {
        vec![&self.ohlcs]
    }

    fn to_inserted_mut_height_map_vec(&mut self) -> Vec<&mut dyn AnyHeightMap> {
        vec![&mut self.ohlcs]
    }

    fn to_computed_height_map_vec(&self) -> Vec<&(dyn AnyHeightMap + Send + Sync)> {
        vec![&self.closes]
    }

    fn to_computed_mut_height_map_vec(&mut self) -> Vec<&mut dyn AnyHeightMap> {
        vec![&mut self.closes]
    }
}
