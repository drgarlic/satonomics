use std::collections::BTreeMap;

use chrono::{Days, NaiveDate};
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

    // Computed
    pub closes: DateMap<f32>,
    pub market_cap: DateMap<f32>,
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
    pub price_1d_total_return: DateMap<f32>,
    pub price_1m_total_return: DateMap<f32>,
    pub price_6m_total_return: DateMap<f32>,
    pub price_1y_total_return: DateMap<f32>,
    pub price_2y_total_return: DateMap<f32>,
    pub price_3y_total_return: DateMap<f32>,
    pub price_4y_total_return: DateMap<f32>,
    pub price_6y_total_return: DateMap<f32>,
    pub price_8y_total_return: DateMap<f32>,
    pub price_10y_total_return: DateMap<f32>,
    pub price_4y_compound_return: DateMap<f32>,
    // volatility
    // drawdown
    // sats per dollar
}

impl DateDataset {
    pub fn import(price_path: &str, datasets_path: &str) -> color_eyre::Result<Self> {
        let f = |s: &str| format!("{datasets_path}/{s}");

        let mut s = Self {
            min_initial_states: MinInitialStates::default(),

            kraken_daily: None,

            ohlcs: DateMap::_new_json(1, &format!("{price_path}/ohlc"), usize::MAX, true),
            closes: DateMap::_new_json(1, &f("close"), usize::MAX, true),
            market_cap: DateMap::new_bin(1, &f("market_cap")),
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
            price_1d_total_return: DateMap::new_bin(1, &f("price_1d_total_return")),
            price_1m_total_return: DateMap::new_bin(1, &f("price_1m_total_return")),
            price_6m_total_return: DateMap::new_bin(1, &f("price_6m_total_return")),
            price_1y_total_return: DateMap::new_bin(1, &f("price_1y_total_return")),
            price_2y_total_return: DateMap::new_bin(1, &f("price_2y_total_return")),
            price_3y_total_return: DateMap::new_bin(1, &f("price_3y_total_return")),
            price_4y_total_return: DateMap::new_bin(1, &f("price_4y_total_return")),
            price_6y_total_return: DateMap::new_bin(1, &f("price_6y_total_return")),
            price_8y_total_return: DateMap::new_bin(1, &f("price_8y_total_return")),
            price_10y_total_return: DateMap::new_bin(1, &f("price_10y_total_return")),
            price_4y_compound_return: DateMap::new_bin(1, &f("price_4y_compound_return")),
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

    pub fn compute(
        &mut self,
        &ComputeData { dates, .. }: &ComputeData,
        circulating_supply: &mut DateMap<f64>,
    ) {
        self.closes
            .multi_insert_simple_transform(dates, &mut self.ohlcs, |ohlc| ohlc.close);

        self.market_cap
            .multi_insert_multiply(dates, &mut self.closes, circulating_supply);

        self.price_1w_sma
            .multi_insert_simple_average(dates, &mut self.closes, ONE_WEEK_IN_DAYS);

        self.price_1m_sma
            .multi_insert_simple_average(dates, &mut self.closes, ONE_MONTH_IN_DAYS);

        self.price_1y_sma
            .multi_insert_simple_average(dates, &mut self.closes, ONE_YEAR_IN_DAYS);

        self.price_2y_sma.multi_insert_simple_average(
            dates,
            &mut self.closes,
            2 * ONE_YEAR_IN_DAYS,
        );

        self.price_4y_sma.multi_insert_simple_average(
            dates,
            &mut self.closes,
            4 * ONE_YEAR_IN_DAYS,
        );

        self.price_8d_sma
            .multi_insert_simple_average(dates, &mut self.closes, 8);

        self.price_13d_sma
            .multi_insert_simple_average(dates, &mut self.closes, 13);

        self.price_21d_sma
            .multi_insert_simple_average(dates, &mut self.closes, 21);

        self.price_34d_sma
            .multi_insert_simple_average(dates, &mut self.closes, 34);

        self.price_55d_sma
            .multi_insert_simple_average(dates, &mut self.closes, 55);

        self.price_89d_sma
            .multi_insert_simple_average(dates, &mut self.closes, 89);

        self.price_144d_sma
            .multi_insert_simple_average(dates, &mut self.closes, 144);

        self.price_200w_sma.multi_insert_simple_average(
            dates,
            &mut self.closes,
            200 * ONE_WEEK_IN_DAYS,
        );

        self.price_1d_total_return
            .multi_insert_percentage_change(dates, &mut self.closes, 1);
        self.price_1m_total_return.multi_insert_percentage_change(
            dates,
            &mut self.closes,
            ONE_MONTH_IN_DAYS,
        );
        self.price_6m_total_return.multi_insert_percentage_change(
            dates,
            &mut self.closes,
            6 * ONE_MONTH_IN_DAYS,
        );
        self.price_1y_total_return.multi_insert_percentage_change(
            dates,
            &mut self.closes,
            ONE_YEAR_IN_DAYS,
        );
        self.price_2y_total_return.multi_insert_percentage_change(
            dates,
            &mut self.closes,
            2 * ONE_YEAR_IN_DAYS,
        );
        self.price_3y_total_return.multi_insert_percentage_change(
            dates,
            &mut self.closes,
            3 * ONE_YEAR_IN_DAYS,
        );
        self.price_4y_total_return.multi_insert_percentage_change(
            dates,
            &mut self.closes,
            4 * ONE_YEAR_IN_DAYS,
        );
        self.price_6y_total_return.multi_insert_percentage_change(
            dates,
            &mut self.closes,
            6 * ONE_YEAR_IN_DAYS,
        );
        self.price_8y_total_return.multi_insert_percentage_change(
            dates,
            &mut self.closes,
            8 * ONE_YEAR_IN_DAYS,
        );
        self.price_10y_total_return.multi_insert_percentage_change(
            dates,
            &mut self.closes,
            10 * ONE_YEAR_IN_DAYS,
        );

        self.price_4y_compound_return
            .multi_insert_complex_transform(
                dates,
                &mut self.closes,
                |(last_value, date, closes)| {
                    let previous_value = date
                        .checked_sub_days(Days::new(4 * ONE_YEAR_IN_DAYS as u64))
                        .and_then(|date| closes.get_or_import(date))
                        .unwrap_or_default();

                    (((last_value / previous_value).powf(1.0 / 4.0)) - 1.0) * 100.0
                },
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
            &self.market_cap,
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
            &self.price_1d_total_return,
            &self.price_1m_total_return,
            &self.price_6m_total_return,
            &self.price_1y_total_return,
            &self.price_2y_total_return,
            &self.price_3y_total_return,
            &self.price_4y_total_return,
            &self.price_6y_total_return,
            &self.price_8y_total_return,
            &self.price_10y_total_return,
            &self.price_4y_compound_return,
        ]
    }

    fn to_computed_mut_date_map_vec(&mut self) -> Vec<&mut dyn AnyDateMap> {
        vec![
            &mut self.closes,
            &mut self.market_cap,
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
            &mut self.price_1d_total_return,
            &mut self.price_1m_total_return,
            &mut self.price_6m_total_return,
            &mut self.price_1y_total_return,
            &mut self.price_2y_total_return,
            &mut self.price_3y_total_return,
            &mut self.price_4y_total_return,
            &mut self.price_6y_total_return,
            &mut self.price_8y_total_return,
            &mut self.price_10y_total_return,
            &mut self.price_4y_compound_return,
        ]
    }
}
