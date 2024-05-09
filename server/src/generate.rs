use std::collections::{BTreeMap, HashMap};

use derive_deref::{Deref, DerefMut};
use parser::Json;
use serde::Serialize;

use crate::{
    routes::{Route, Routes},
    Grouped,
};

#[derive(Clone, Default, Deref, DerefMut, Debug, Serialize)]
pub struct Paths(pub Grouped<BTreeMap<String, String>>);

pub fn generate_paths_json_file(routes: &Routes) {
    let transform = |map: &HashMap<String, Route>| -> BTreeMap<String, String> {
        map.iter()
            .map(|(key, route)| (key.to_owned(), route.url_path.to_owned()))
            .collect()
    };

    let date_paths = transform(&routes.date);
    let height_paths = transform(&routes.height);
    let last_paths = transform(&routes.last);

    let paths = Paths(Grouped {
        date: date_paths,
        height: height_paths,
        last: last_paths,
    });

    let _ = Json::export("../datasets/grouped_keys_to_url_path.json", &paths);
}
