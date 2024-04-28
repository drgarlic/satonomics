use savefile_derive::Savefile;
use serde::{Deserialize, Serialize};

#[allow(clippy::upper_case_acronyms)]
#[derive(Debug, Default, Deserialize, Serialize, Savefile, Clone, Copy)]
pub struct OHLC {
    pub open: f32,
    pub high: f32,
    pub low: f32,
    pub close: f32,
}
