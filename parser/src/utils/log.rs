use chrono::Local;
use color_eyre::owo_colors::OwoColorize;

#[inline(always)]
pub fn log(str: &str) {
    let datetime = Local::now();

    let formatted = format!("{}", datetime.format("%Y-%m-%d %H:%M:%S -"));

    println!("{} {}", formatted.bright_black(), str);
}
