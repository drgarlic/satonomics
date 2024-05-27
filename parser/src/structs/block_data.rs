use savefile_derive::Savefile;

#[derive(Savefile, Debug)]
pub struct BlockData {
    pub height: u32,
    pub price: f32,
    // pub date: WNaiveDate,
    pub timestamp: u32,
    pub amount: u64,
    pub spendable_outputs: u32,
}

impl BlockData {
    pub fn new(
        height: u32,
        price: f32,
        timestamp: u32,
        // date: NaiveDate
    ) -> Self {
        Self {
            height,
            price,
            timestamp,
            amount: 0,
            spendable_outputs: 0,
            // date: WNaiveDate::wrap(date),
        }
    }

    // pub fn has_equal_height(&self, other: &Self) -> bool {
    //     self.height == other.height
    // }

    // pub fn has_lower_or_equal_height(&self, other: &Self) -> bool {
    //     self.height <= other.height
    // }

    // pub fn has_lower_or_equal_timestamp(&self, other: &Self) -> bool {
    //     self.timestamp <= other.timestamp
    // }
}
