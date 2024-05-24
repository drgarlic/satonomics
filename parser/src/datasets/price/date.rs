use std::collections::BTreeMap;

use chrono::NaiveDate;
use color_eyre::eyre::Error;

use crate::{
    datasets::{AnyDataset, ComputeData, MinInitialStates},
    price::{Binance, Kraken},
    structs::{AnyDateMap, DateMap},
    utils::{ONE_MONTH_IN_DAYS, ONE_WEEK_IN_DAYS, ONE_YEAR_IN_DAYS},
};

use super::OHLC;

pub struct DateDataset {
    min_initial_states: MinInitialStates,

    kraken_daily: Option<BTreeMap<NaiveDate, OHLC>>,

    // Inserted
    pub ohlcs: DateMap<OHLC>,
    pub closes: DateMap<f32>,

    // Computed
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
    pub price_200w_sma: DateMap<f32>,
}

impl DateDataset {
    pub fn import(price_path: &str, datasets_path: &str) -> color_eyre::Result<Self> {
        let f = |s: &str| format!("{datasets_path}/{s}");

        let mut s = Self {
            min_initial_states: MinInitialStates::default(),

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
            price_200w_sma: DateMap::new_bin(1, &f("price_200w_sma")),
        };

        s.min_initial_states
            .consume(MinInitialStates::compute_from_dataset(&s));

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

    pub fn compute(&mut self, &ComputeData { dates, .. }: &ComputeData) {
        self.closes
            .multiple_insert_simple_transform(dates, &mut self.ohlcs, |ohlc| ohlc.close);

        self.price_1w_sma
            .multiple_insert_simple_average(dates, &mut self.closes, ONE_WEEK_IN_DAYS);

        self.price_1m_sma.multiple_insert_simple_average(
            dates,
            &mut self.closes,
            ONE_MONTH_IN_DAYS,
        );

        self.price_1y_sma
            .multiple_insert_simple_average(dates, &mut self.closes, ONE_YEAR_IN_DAYS);

        self.price_2y_sma.multiple_insert_simple_average(
            dates,
            &mut self.closes,
            2 * ONE_YEAR_IN_DAYS,
        );

        self.price_4y_sma.multiple_insert_simple_average(
            dates,
            &mut self.closes,
            4 * ONE_YEAR_IN_DAYS,
        );

        self.price_8d_sma
            .multiple_insert_simple_average(dates, &mut self.closes, 8);

        self.price_13d_sma
            .multiple_insert_simple_average(dates, &mut self.closes, 13);

        self.price_21d_sma
            .multiple_insert_simple_average(dates, &mut self.closes, 21);

        self.price_34d_sma
            .multiple_insert_simple_average(dates, &mut self.closes, 34);

        self.price_55d_sma
            .multiple_insert_simple_average(dates, &mut self.closes, 55);

        self.price_89d_sma
            .multiple_insert_simple_average(dates, &mut self.closes, 89);

        self.price_144d_sma
            .multiple_insert_simple_average(dates, &mut self.closes, 144);

        self.price_200w_sma.multiple_insert_simple_average(
            dates,
            &mut self.closes,
            200 * ONE_WEEK_IN_DAYS,
        );
    }
}

impl AnyDataset for DateDataset {
    fn get_min_initial_states(&self) -> &MinInitialStates {
        &self.min_initial_states
    }

    fn to_inserted_date_map_vec(&self) -> Vec<&(dyn AnyDateMap + Send + Sync)> {
        vec![&self.ohlcs]
    }

    fn to_inserted_mut_date_map_vec(&mut self) -> Vec<&mut dyn AnyDateMap> {
        vec![&mut self.ohlcs]
    }

    fn to_computed_date_map_vec(&self) -> Vec<&(dyn AnyDateMap + Send + Sync)> {
        vec![
            &self.closes,
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
            &self.price_200w_sma,
        ]
    }

    fn to_computed_mut_date_map_vec(&mut self) -> Vec<&mut dyn AnyDateMap> {
        vec![
            &mut self.closes,
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
            &mut self.price_200w_sma,
        ]
    }
}
