use std::collections::BTreeMap;

use axum::{
    extract::{Path, Query, State},
    http::HeaderMap,
    response::{IntoResponse, Response},
};
use color_eyre::eyre::eyre;
use itertools::Itertools;
use reqwest::{header::HOST, StatusCode};
use serde::Deserialize;

use parser::{DateMap, HeightMap, Json, Serialization, HEIGHT_MAP_CHUNK_SIZE, OHLC};

use crate::{chunk::Chunk, kind::Kind, response::typed_value_to_response, AppState};

#[derive(Deserialize)]
pub struct Params {
    chunk: Option<usize>,
}

pub async fn file_handler(
    headers: HeaderMap,
    path: Path<String>,
    query: Query<Params>,
    State(app_state): State<AppState>,
) -> Response {
    match _file_handler(headers, path, query, app_state) {
        Ok(response) => response,
        Err(error) => (StatusCode::INTERNAL_SERVER_ERROR, error.to_string()).into_response(),
    }
}

fn _file_handler(
    headers: HeaderMap,
    Path(path): Path<String>,
    query: Query<Params>,
    AppState { routes }: AppState,
) -> color_eyre::Result<Response> {
    if path.contains("favicon") {
        return Err(eyre!("Don't support favicon"));
    }

    println!("fetch: {}", path);

    let date_prefix = "date-to-";
    let height_prefix = "height-to-";

    let (kind, route) = if path.starts_with(date_prefix) {
        (
            Kind::Date,
            routes
                .date
                .get(&path.strip_prefix(date_prefix).unwrap().replace('-', "_")),
        )
    } else if path.starts_with(height_prefix) {
        (
            Kind::Height,
            routes
                .height
                .get(&path.strip_prefix(height_prefix).unwrap().replace('-', "_")),
        )
    } else {
        (Kind::Last, routes.last.get(&path.replace('-', "_")))
    };

    if route.is_none() {
        return Err(eyre!("Path error"));
    }

    let mut route = route.unwrap().to_owned();

    let mut chunk = None;

    if kind != Kind::Last {
        let datasets = match kind {
            Kind::Date => DateMap::<usize>::_read_dir(&route.file_path, &route.serialization),
            Kind::Height => HeightMap::<usize>::_read_dir(&route.file_path, &route.serialization),
            _ => panic!(),
        };

        let (last_chunk_id, last_chunk_path) = datasets.last_key_value().unwrap();

        let mut chunk_id = query.chunk.unwrap_or(*last_chunk_id);

        route.file_path = if let Some(path) = datasets.get(&chunk_id) {
            path
        } else {
            chunk_id = *last_chunk_id;
            last_chunk_path
        }
        .to_str()
        .unwrap()
        .to_string();

        let offset = match kind {
            Kind::Date => 1,
            Kind::Height => HEIGHT_MAP_CHUNK_SIZE,
            _ => panic!(),
        };

        let offsetted_to_url = |offseted| {
            datasets.get(&offseted).map(|_| {
                let host = headers[HOST].to_str().unwrap();
                let scheme = if host.contains("0.0.0.0") || host.contains("localhost") {
                    "http"
                } else {
                    "https"
                };

                format!("{scheme}://{host}{}?chunk={offseted}", route.url_path)
            })
        };

        chunk = Some(Chunk {
            id: chunk_id,
            next: chunk_id.checked_add(offset).and_then(offsetted_to_url),
            previous: chunk_id.checked_sub(offset).and_then(offsetted_to_url),
        })
    }

    let type_name = route.values_type.split("::").last().unwrap();

    let value = match type_name {
        "u32" => typed_value_to_response::<u32>(kind, &route.file_path, chunk)?,
        "u64" => typed_value_to_response::<u64>(kind, &route.file_path, chunk)?,
        "usize" => typed_value_to_response::<usize>(kind, &route.file_path, chunk)?,
        "f32" => typed_value_to_response::<f32>(kind, &route.file_path, chunk)?,
        "f64" => typed_value_to_response::<f64>(kind, &route.file_path, chunk)?,
        "OHLC" => typed_value_to_response::<OHLC>(kind, &route.file_path, chunk)?,
        _ => panic!("Incompatible type: {type_name}"),
    };

    Ok(value)
}

fn _file_handler2(
    headers: HeaderMap,
    Path(path): Path<String>,
    query: Query<Params>,
    AppState { routes }: AppState,
) -> color_eyre::Result<Response> {
    if path.contains("favicon") {
        return Err(eyre!("Don't support favicon"));
    }

    println!("fetch: {}", path);

    let sanitized = path.replace(['.', '/', '\\'], "");
    let transformed = sanitized.replace('-', "/");

    let mut kind = Kind::Last;
    let mut dataset_path = format_dataset_path(&format!("{transformed}/last.bin"));
    let mut type_name = None;
    let mut relative_path = format_relative_path(&dataset_path);
    let mut chunk = None;

    if sanitized.starts_with("date-to") || sanitized.starts_with("height-to") {
        let mut split = transformed.split('/');

        let kind_str = split.next().unwrap();

        kind = Kind::from_str(kind_str);

        // skip the "to"
        split.next();

        let joined_split = format!("{}/{}", split.join("/"), kind_str);

        let is_price_folder = joined_split.starts_with("ohlc/");

        if is_price_folder {
            type_name = Some("ohlc".to_string());

            dataset_path = format!("price/{joined_split}");
        } else {
            dataset_path = format_dataset_path(&joined_split);
        }

        relative_path = format_relative_path(&dataset_path);

        let serialization = if is_price_folder {
            Serialization::Json
        } else {
            Serialization::Binary
        };

        let datasets = match kind {
            Kind::Date => DateMap::<usize>::_read_dir(&relative_path, &serialization),
            Kind::Height => HeightMap::<usize>::_read_dir(&relative_path, &serialization),
            _ => panic!(),
        };

        let (last_chunk_id, last_chunk_path) = datasets.last_key_value().unwrap();

        let mut chunk_id = query.chunk.unwrap_or(*last_chunk_id);

        relative_path = datasets
            .get(&chunk_id)
            .unwrap_or_else(|| {
                chunk_id = *last_chunk_id;
                last_chunk_path
            })
            .to_str()
            .unwrap()
            .to_string();

        let offset = match kind {
            Kind::Date => 1,
            Kind::Height => HEIGHT_MAP_CHUNK_SIZE,
            _ => panic!(),
        };

        let offsetted_to_url = |offseted| {
            datasets.get(&offseted).map(|_| {
                let host = headers[HOST].to_str().unwrap();
                let scheme = if host.contains("0.0.0.0") || host.contains("localhost") {
                    "http"
                } else {
                    "https"
                };

                format!("{scheme}://{host}/{sanitized}?chunk={offseted}",)
            })
        };

        chunk = Some(Chunk {
            id: chunk_id,
            next: chunk_id.checked_add(offset).and_then(offsetted_to_url),
            previous: chunk_id.checked_sub(offset).and_then(offsetted_to_url),
        })
    }

    if type_name.is_none() {
        let saved_path = format!("../{}", dataset_path);

        let path_to_type: BTreeMap<String, String> =
            Json::import("../datasets/disk_path_to_type.json").unwrap();

        type_name = Some(path_to_type.get(&saved_path).cloned().unwrap_or_else(|| {
            // dbg!(&path_to_type);
            panic!("Fail for {saved_path}")
        }));
    }

    dbg!(&relative_path);

    let type_name = type_name.unwrap();

    let value = match type_name.as_str() {
        "u32" => typed_value_to_response::<u32>(kind, &relative_path, chunk)?,
        "u64" => typed_value_to_response::<u64>(kind, &relative_path, chunk)?,
        "usize" => typed_value_to_response::<usize>(kind, &relative_path, chunk)?,
        "f32" => typed_value_to_response::<f32>(kind, &relative_path, chunk)?,
        "f64" => typed_value_to_response::<f64>(kind, &relative_path, chunk)?,
        "ohlc" => typed_value_to_response::<OHLC>(kind, &relative_path, chunk)?,
        _ => panic!("Incompatible type: {type_name}"),
    };

    Ok(value)
}

fn format_dataset_path(query_path: &str) -> String {
    format!("datasets/{}", query_path)
}

fn format_relative_path(dataset_path: &str) -> String {
    format!("../{}", dataset_path)
}
