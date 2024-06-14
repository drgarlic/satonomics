use allocative::Allocative;
use bincode::{Decode, Encode};

use super::{BlockData, WNaiveDate};

#[derive(Debug, Encode, Decode, Allocative)]
pub struct DateData {
    pub date: WNaiveDate,
    pub blocks: Vec<BlockData>,
}

impl DateData {
    pub fn new(date: WNaiveDate, blocks: Vec<BlockData>) -> Self {
        Self { date, blocks }
    }
}
