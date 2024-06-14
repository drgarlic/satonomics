use allocative::Allocative;
use bincode::{Decode, Encode};

use super::WAmount;

#[derive(Debug, Encode, Decode, Allocative)]
pub struct BlockData {
    pub height: u32,
    pub price: f32,
    pub timestamp: u32,
    pub amount: WAmount,
    pub spendable_outputs: u32,
}

impl BlockData {
    pub fn new(height: u32, price: f32, timestamp: u32) -> Self {
        Self {
            height,
            price,
            timestamp,
            amount: WAmount::ZERO,
            spendable_outputs: 0,
        }
    }
}
