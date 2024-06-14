pub const ONE_DAY_IN_DAYS: usize = 1;
pub const ONE_WEEK_IN_DAYS: usize = 7;
pub const TWO_WEEK_IN_DAYS: usize = 2 * ONE_WEEK_IN_DAYS;
pub const ONE_MONTH_IN_DAYS: usize = 30;
pub const THREE_MONTHS_IN_DAYS: usize = 3 * ONE_MONTH_IN_DAYS;
pub const ONE_YEAR_IN_DAYS: usize = 365;

pub const ONE_MINUTE_IN_S: usize = 60;
pub const ONE_HOUR_IN_S: usize = 60 * ONE_MINUTE_IN_S;
pub const ONE_DAY_IN_S: usize = 24 * ONE_HOUR_IN_S;
pub const ONE_YEAR_IN_S: usize = ONE_YEAR_IN_DAYS * ONE_DAY_IN_S;

pub const TIMESTAMP_STARTING_YEAR: usize = 1970;

pub fn timestamp_to_year(timestamp: u32) -> u32 {
    ((timestamp as usize / ONE_YEAR_IN_S) + TIMESTAMP_STARTING_YEAR) as u32
}
