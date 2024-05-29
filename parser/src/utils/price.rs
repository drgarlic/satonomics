const SIGNIFICANT_DIGITS: i32 = 5; // TODO: Need to try 4 and see how it would impact the realized cap for example

pub fn convert_price_to_significant_cents(price: f32) -> u32 {
    convert_cents_to_significant_cents((price * 100.0) as u32)
}

pub fn convert_cents_to_significant_cents(cents: u32) -> u32 {
    let mut cents = cents;

    let ilog10 = cents.checked_ilog10().unwrap_or(0) as i32;

    if ilog10 >= SIGNIFICANT_DIGITS {
        let log_diff = ilog10 - SIGNIFICANT_DIGITS + 1;

        let pow = 10.0_f64.powi(log_diff);

        cents = ((cents as f64 / pow).round() * pow) as u32;
    }

    cents
}
