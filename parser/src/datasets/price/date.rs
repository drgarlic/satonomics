use std::collections::BTreeMap;

use chrono::NaiveDate;
use color_eyre::eyre::Error;

use crate::{
    datasets::{AnyDataset, MinInitialState, ProcessedBlockData},
    price::{Binance, Kraken},
    structs::{AnyDateMap, DateMap},
    utils::{ONE_MONTH_IN_DAYS, ONE_WEEK_IN_DAYS, ONE_YEAR_IN_DAYS},
};

use super::OHLC;

pub struct DateDataset {
    min_initial_state: MinInitialState,

    kraken_daily: Option<BTreeMap<NaiveDate, OHLC>>,

    pub ohlcs: DateMap<OHLC>,
    pub closes: DateMap<f32>,
    pub price_1w_sma: DateMap<f32>,
    pub price_1m_sma: DateMap<f32>,
    pub price_1y_sma: DateMap<f32>,
    pub price_2y_sma: DateMap<f32>,
    pub price_4y_sma: DateMap<f32>,
    pub price_8d_sma: DateMap<f32>,
    pub price_13d_sma: DateMap<f32>,
    pub price_21d_sma: DateMap<f32>,
    pub price_34d_sma: DateMap<f32>,
    pub price_55d_sma: DateMap<f32>,
    pub price_89d_sma: DateMap<f32>,
    pub price_144d_sma: DateMap<f32>,
}

impl DateDataset {
    pub fn import(price_path: &str, datasets_path: &str) -> color_eyre::Result<Self> {
        let f = |s: &str| format!("{datasets_path}/{s}");

        let mut s = Self {
            min_initial_state: MinInitialState::default(),

            kraken_daily: None,

            ohlcs: DateMap::_new_json(1, &format!("{price_path}/ohlc"), usize::MAX, true),
            closes: DateMap::_new_json(1, &f("close"), usize::MAX, true),
            price_1w_sma: DateMap::new_bin(1, &f("price_1w_sma")),
            price_1m_sma: DateMap::new_bin(1, &f("price_1m_sma")),
            price_1y_sma: DateMap::new_bin(1, &f("price_1y_sma")),
            price_2y_sma: DateMap::new_bin(1, &f("price_2y_sma")),
            price_4y_sma: DateMap::new_bin(1, &f("price_4y_sma")),
            price_8d_sma: DateMap::new_bin(1, &f("price_8d_sma")),
            price_13d_sma: DateMap::new_bin(1, &f("price_13d_sma")),
            price_21d_sma: DateMap::new_bin(1, &f("price_21d_sma")),
            price_34d_sma: DateMap::new_bin(1, &f("price_34d_sma")),
            price_55d_sma: DateMap::new_bin(1, &f("price_55d_sma")),
            price_89d_sma: DateMap::new_bin(1, &f("price_89d_sma")),
            price_144d_sma: DateMap::new_bin(1, &f("price_144d_sma")),
        };

        s.min_initial_state
            .consume(MinInitialState::compute_from_dataset(&s));

        Ok(s)
    }

    pub fn get(&mut self, date: NaiveDate) -> color_eyre::Result<OHLC> {
        if self.ohlcs.is_date_safe(date) {
            Ok(self.ohlcs.get(date).unwrap().to_owned())
        } else {
            let ohlc = self.get_from_daily_kraken(&date)?;

            self.ohlcs.insert(date, ohlc);

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

    pub fn insert_data(
        &mut self,
        &ProcessedBlockData {
            is_date_last_block,
            date,
            ..
        }: &ProcessedBlockData,
    ) {
        if is_date_last_block {
            self.closes
                .insert(date, self.ohlcs.get(date).unwrap().close);

            self.price_1w_sma
                .insert_simple_average(date, &self.closes, ONE_WEEK_IN_DAYS);
            self.price_1m_sma
                .insert_simple_average(date, &self.closes, ONE_MONTH_IN_DAYS);
            self.price_1y_sma
                .insert_simple_average(date, &self.closes, ONE_YEAR_IN_DAYS);
            self.price_2y_sma
                .insert_simple_average(date, &self.closes, 2 * ONE_YEAR_IN_DAYS);
            self.price_4y_sma
                .insert_simple_average(date, &self.closes, 4 * ONE_YEAR_IN_DAYS);
            self.price_8d_sma
                .insert_simple_average(date, &self.closes, 8);
            self.price_13d_sma
                .insert_simple_average(date, &self.closes, 13);
            self.price_21d_sma
                .insert_simple_average(date, &self.closes, 21);
            self.price_34d_sma
                .insert_simple_average(date, &self.closes, 34);
            self.price_55d_sma
                .insert_simple_average(date, &self.closes, 55);
            self.price_89d_sma
                .insert_simple_average(date, &self.closes, 89);
            self.price_144d_sma
                .insert_simple_average(date, &self.closes, 144);
        }
    }
}

impl AnyDataset for DateDataset {
    fn get_min_initial_state(&self) -> &MinInitialState {
        &self.min_initial_state
    }

    fn to_any_date_map_vec(&self) -> Vec<&(dyn AnyDateMap + Send + Sync)> {
        vec![
            &self.ohlcs,
            &self.price_1w_sma,
            &self.price_1m_sma,
            &self.price_1y_sma,
            &self.price_2y_sma,
            &self.price_4y_sma,
            &self.price_8d_sma,
            &self.price_13d_sma,
            &self.price_21d_sma,
            &self.price_34d_sma,
            &self.price_55d_sma,
            &self.price_89d_sma,
            &self.price_144d_sma,
        ]
    }

    fn to_any_mut_date_map_vec(&mut self) -> Vec<&mut dyn AnyDateMap> {
        vec![
            &mut self.ohlcs,
            &mut self.price_1w_sma,
            &mut self.price_1m_sma,
            &mut self.price_1y_sma,
            &mut self.price_2y_sma,
            &mut self.price_4y_sma,
            &mut self.price_8d_sma,
            &mut self.price_13d_sma,
            &mut self.price_21d_sma,
            &mut self.price_34d_sma,
            &mut self.price_55d_sma,
            &mut self.price_89d_sma,
            &mut self.price_144d_sma,
        ]
    }

    fn export(&self) -> color_eyre::Result<()> {
        self.to_any_map_vec()
            .into_iter()
            .try_for_each(|map| -> color_eyre::Result<()> { map.export() })
    }
}
