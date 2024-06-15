use allocative::Allocative;
use bincode::{Decode, Encode};

use super::{Price, WAmount};

#[derive(Debug, Encode, Decode, Allocative)]
pub struct BlockData {
    pub height: u32,
    pub price: Price,
    pub timestamp: u32,
    pub amount: WAmount,
    pub spendable_outputs: u32,
}

impl BlockData {
    pub fn new(height: u32, price: Price, timestamp: u32) -> Self {
        Self {
            height,
            price,
            timestamp,
            amount: WAmount::ZERO,
            spendable_outputs: 0,
        }
    }
}
