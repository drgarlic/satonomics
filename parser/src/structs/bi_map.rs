use std::{
    fmt::Debug,
    iter::Sum,
    ops::{Add, Div, Mul, RangeInclusive, Sub},
};

use chrono::NaiveDate;
use ordered_float::FloatCore;
use serde::{de::DeserializeOwned, Serialize};

use crate::bitcoin::TARGET_BLOCKS_PER_DAY;

use super::{AnyDateMap, AnyHeightMap, AnyMap, DateMap, HeightMap};

pub struct BiMap<T>
where
    T: Clone
        + Copy
        + Default
        + Debug
        + Serialize
        + DeserializeOwned
        + savefile::Serialize
        + savefile::Deserialize
        + savefile::ReprC,
{
    pub height: HeightMap<T>,
    pub date: DateMap<T>,
}

impl<T> BiMap<T>
where
    T: Clone
        + Copy
        + Default
        + Debug
        + Serialize
        + DeserializeOwned
        + savefile::Serialize
        + savefile::Deserialize
        + savefile::ReprC,
{
    pub fn new_bin(version: u32, path: &str) -> Self {
        Self {
            height: HeightMap::_new_bin(version, path, 1, true),
            date: DateMap::_new_bin(version, path, 1, false),
        }
    }

    pub fn _new_bin(version: u32, path: &str, height_chunks_in_memory: usize) -> Self {
        Self {
            height: HeightMap::_new_bin(version, path, height_chunks_in_memory, true),
            date: DateMap::_new_bin(version, path, height_chunks_in_memory, false),
        }
    }

    // pub fn new_json(path: &str) -> Self {
    //     Self {
    //         height: HeightMap::_new_json(path, true),
    //         date: DateMap::_new_json(path, false),
    //     }
    // }

    pub fn date_insert_sum_range(
        &mut self,
        date: NaiveDate,
        date_blocks_range: &RangeInclusive<usize>,
    ) where
        T: Sum,
    {
        self.date
            .insert(date, self.height.sum_range(date_blocks_range));
    }

    pub fn multiple_date_insert_sum_range(
        &mut self,
        dates: &[NaiveDate],
        first_height: &mut DateMap<usize>,
        last_height: &mut DateMap<usize>,
    ) where
        T: Sum,
    {
        dates.iter().for_each(|date| {
            let date = *date;

            let first_height = first_height.get_or_import(date).unwrap();
            let last_height = last_height.get_or_import(date).unwrap();
            let range = first_height..=last_height;

            self.date.insert(date, self.height.sum_range(&range));
        })
    }

    pub fn multiple_insert_simple_transform<F>(
        &mut self,
        heights: &[usize],
        dates: &[NaiveDate],
        source: &mut BiMap<T>,
        transform: &F,
    ) where
        T: Div<Output = T>,
        F: Fn(T) -> T,
    {
        self.height
            .multiple_insert_simple_transform(heights, &mut source.height, transform);
        self.date
            .multiple_insert_simple_transform(dates, &mut source.date, transform);
    }

    #[allow(unused)]
    pub fn multiple_insert_add(
        &mut self,
        heights: &[usize],
        dates: &[NaiveDate],
        added: &mut BiMap<T>,
        adder: &mut BiMap<T>,
    ) where
        T: Add<Output = T>,
    {
        self.height
            .multiple_insert_add(heights, &mut added.height, &mut adder.height);
        self.date
            .multiple_insert_add(dates, &mut added.date, &mut adder.date);
    }

    pub fn multiple_insert_subtract(
        &mut self,
        heights: &[usize],
        dates: &[NaiveDate],
        subtracted: &mut BiMap<T>,
        subtracter: &mut BiMap<T>,
    ) where
        T: Sub<Output = T>,
    {
        self.height.multiple_insert_subtract(
            heights,
            &mut subtracted.height,
            &mut subtracter.height,
        );

        self.date
            .multiple_insert_subtract(dates, &mut subtracted.date, &mut subtracter.date);
    }

    pub fn multiple_insert_multiply(
        &mut self,
        heights: &[usize],
        dates: &[NaiveDate],
        multiplied: &mut BiMap<T>,
        multiplier: &mut BiMap<T>,
    ) where
        T: Mul<Output = T>,
    {
        self.height.multiple_insert_multiply(
            heights,
            &mut multiplied.height,
            &mut multiplier.height,
        );
        self.date
            .multiple_insert_multiply(dates, &mut multiplied.date, &mut multiplier.date);
    }

    pub fn multiple_insert_divide(
        &mut self,
        heights: &[usize],
        dates: &[NaiveDate],
        divided: &mut BiMap<T>,
        divider: &mut BiMap<T>,
    ) where
        T: Div<Output = T>,
    {
        self.height
            .multiple_insert_divide(heights, &mut divided.height, &mut divider.height);
        self.date
            .multiple_insert_divide(dates, &mut divided.date, &mut divider.date);
    }

    pub fn multiple_insert_cumulative(
        &mut self,
        heights: &[usize],
        dates: &[NaiveDate],
        source: &mut BiMap<T>,
    ) where
        T: Add<Output = T> + Sub<Output = T>,
    {
        self.height
            .multiple_insert_cumulative(heights, &mut source.height);
        self.date
            .multiple_insert_cumulative(dates, &mut source.date);
    }

    pub fn multiple_insert_last_x_sum(
        &mut self,
        heights: &[usize],
        dates: &[NaiveDate],
        source: &mut BiMap<T>,
        days: usize,
    ) where
        T: Add<Output = T> + Sub<Output = T>,
    {
        self.height.multiple_insert_last_x_sum(
            heights,
            &mut source.height,
            TARGET_BLOCKS_PER_DAY * days,
        );

        self.date
            .multiple_insert_last_x_sum(dates, &mut source.date, days);
    }

    pub fn multiple_insert_net_change(
        &mut self,
        heights: &[usize],
        dates: &[NaiveDate],
        source: &mut BiMap<T>,
        days: usize,
    ) where
        T: Sub<Output = T>,
    {
        self.height.multiple_insert_net_change(
            heights,
            &mut source.height,
            TARGET_BLOCKS_PER_DAY * days,
        );
        self.date
            .multiple_insert_net_change(dates, &mut source.date, days);
    }

    pub fn multiple_insert_median(
        &mut self,
        heights: &[usize],
        dates: &[NaiveDate],
        source: &mut BiMap<T>,
        days: Option<usize>,
    ) where
        T: FloatCore,
    {
        self.height.multiple_insert_median(
            heights,
            &mut source.height,
            days.map(|days| TARGET_BLOCKS_PER_DAY * days),
        );
        self.date
            .multiple_insert_median(dates, &mut source.date, days);
    }

    #[allow(unused)]
    pub fn multiple_insert_percentile(
        &mut self,
        heights: &[usize],
        dates: &[NaiveDate],
        source: &mut BiMap<T>,
        percentile: f32,
        days: Option<usize>,
    ) where
        T: FloatCore,
    {
        self.height.multiple_insert_percentile(
            heights,
            &mut source.height,
            percentile,
            days.map(|days| TARGET_BLOCKS_PER_DAY * days),
        );
        self.date
            .multiple_insert_percentile(dates, &mut source.date, percentile, days);
    }
}

pub trait AnyBiMap {
    // fn are_date_and_height_safe(&self, date: NaiveDate, height: usize) -> bool;

    #[allow(unused)]
    fn as_any_map(&self) -> Vec<&(dyn AnyMap + Send + Sync)>;

    fn as_any_mut_map(&mut self) -> Vec<&mut dyn AnyMap>;

    fn get_height(&self) -> &(dyn AnyHeightMap + Send + Sync);

    #[allow(unused)]
    fn get_mut_height(&mut self) -> &mut dyn AnyHeightMap;

    fn get_date(&self) -> &(dyn AnyDateMap + Send + Sync);

    #[allow(unused)]
    fn get_mut_date(&mut self) -> &mut dyn AnyDateMap;
}

impl<T> AnyBiMap for BiMap<T>
where
    T: Clone
        + Copy
        + Default
        + Debug
        + Serialize
        + DeserializeOwned
        + savefile::Serialize
        + savefile::Deserialize
        + savefile::ReprC
        + Send
        + Sync,
{
    // #[inline(always)]
    // fn are_date_and_height_safe(&self, date: NaiveDate, height: usize) -> bool {
    //     self.date.is_date_safe(date) && self.height.is_height_safe(height)
    // }

    fn as_any_map(&self) -> Vec<&(dyn AnyMap + Send + Sync)> {
        vec![self.date.as_any_map(), self.height.as_any_map()]
    }

    fn as_any_mut_map(&mut self) -> Vec<&mut dyn AnyMap> {
        vec![self.date.as_any_mut_map(), self.height.as_any_mut_map()]
    }

    fn get_height(&self) -> &(dyn AnyHeightMap + Send + Sync) {
        &self.height
    }

    fn get_mut_height(&mut self) -> &mut dyn AnyHeightMap {
        &mut self.height
    }

    fn get_date(&self) -> &(dyn AnyDateMap + Send + Sync) {
        &self.date
    }

    fn get_mut_date(&mut self) -> &mut dyn AnyDateMap {
        &mut self.date
    }
}
