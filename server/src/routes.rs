use std::collections::{BTreeMap, HashMap};

use derive_deref::{Deref, DerefMut};
use itertools::Itertools;
use parser::{Json, Serialization};

use crate::Grouped;

#[derive(Clone, Debug)]
pub struct Route {
    pub url_path: String,
    pub file_path: String,
    pub values_type: String,
    pub serialization: Serialization,
}

#[derive(Clone, Default, Deref, DerefMut)]
pub struct Routes(pub Grouped<HashMap<String, Route>>);

pub fn build_routes() -> Routes {
    let path_to_type: BTreeMap<String, String> =
        Json::import("../datasets/disk_path_to_type.json").unwrap();

    let mut routes = Routes::default();

    path_to_type.into_iter().for_each(|(key, value)| {
        let mut split_key = key.split('/').collect_vec();

        let mut split_last = split_key.pop().unwrap().split('.').rev().collect_vec();
        let last = split_last.pop().unwrap().to_owned();
        let serialization = split_last.pop().map_or_else(
            || {
                if *split_key.get(1).unwrap() == "price" {
                    Serialization::Json
                } else {
                    Serialization::Binary
                }
            },
            Serialization::from_extension,
        );
        let split_key = split_key.iter().skip(2).collect_vec();
        let map_key = split_key.iter().join("_");
        let url_path = split_key.iter().join("-");

        let file_path = key.to_owned();
        let values_type = value.to_owned();

        if last == "date" {
            routes.date.insert(
                map_key,
                Route {
                    url_path: format!("/date-to-{url_path}"),
                    file_path,
                    values_type,
                    serialization,
                },
            );
        } else if last == "height" {
            routes.height.insert(
                map_key,
                Route {
                    url_path: format!("/height-to-{url_path}"),
                    file_path,
                    values_type,
                    serialization,
                },
            );
        } else if last == "last" {
            routes.last.insert(
                map_key,
                Route {
                    url_path: format!("/{url_path}"),
                    file_path,
                    values_type,
                    serialization,
                },
            );
        } else {
            dbg!(&key, value, &last);
            panic!("")
        }
    });

    routes
}
