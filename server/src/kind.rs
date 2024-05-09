#[derive(PartialEq, Eq)]
pub enum Kind {
    Date,
    Height,
    Last,
}

impl Kind {
    pub fn from_str(string: &str) -> Self {
        match string {
            "date" => Self::Date,
            "height" => Self::Height,
            "value" | "last" | "" => Self::Last,
            _ => panic!(),
        }
    }
}
