use chrono::Local;
use color_eyre::owo_colors::OwoColorize;

#[inline(always)]
pub fn log(str: &str) {
    let date_time = format!("{}", Local::now().format("%Y-%m-%d %H:%M:%S -"));

    println!("{} {}", date_time.bright_black(), str);
}
