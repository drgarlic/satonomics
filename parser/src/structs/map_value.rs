use std::fmt::Debug;

use serde::{de::DeserializeOwned, Serialize};

use crate::OHLC;

use super::WNaiveDate;

pub trait MapValue:
    Clone
    + Copy
    + Default
    + Debug
    + Serialize
    + DeserializeOwned
    + savefile::Serialize
    + savefile::Deserialize
    + savefile::ReprC
    + Sync
    + Send
{
}

impl MapValue for u16 {}
impl MapValue for u32 {}
impl MapValue for u64 {}
impl MapValue for usize {}
impl MapValue for f32 {}
impl MapValue for f64 {}
impl MapValue for WNaiveDate {}
impl MapValue for OHLC {}
