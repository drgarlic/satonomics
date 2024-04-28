use std::fmt::Debug;

use axum::{
    http::header,
    response::{IntoResponse, Json, Response},
};
use serde::de::DeserializeOwned;
use serde::Serialize;

use crate::{
    chunk::Chunk,
    imports::{import_map, import_value, import_vec},
    kind::Kind,
};

const STALE_IF_ERROR: u64 = 604800; // 1 Week

#[derive(Serialize)]
struct WrappedDataset<'a, T>
where
    T: Serialize,
{
    source: &'a str,
    chunk: Chunk,
    dataset: T,
}

pub fn typed_value_to_response<T>(
    kind: Kind,
    relative_path: &str,
    chunk: Option<Chunk>,
) -> color_eyre::Result<Response>
where
    T: Serialize + Debug + DeserializeOwned + savefile::Deserialize + savefile::ReprC,
{
    Ok(match kind {
        Kind::Date => dataset_to_response(import_map::<T>(relative_path)?, chunk.unwrap()),
        Kind::Height => dataset_to_response(import_vec::<T>(relative_path)?, chunk.unwrap()),
        Kind::Last => value_to_response(import_value::<T>(relative_path)?),
    })
}

fn value_to_response<T>(value: T) -> Response
where
    T: Serialize,
{
    generic_to_reponse(value, None, 5)
}

fn dataset_to_response<T>(dataset: T, chunk: Chunk) -> Response
where
    T: Serialize,
{
    generic_to_reponse(dataset, Some(chunk), 60)
}

fn generic_to_reponse<T>(generic: T, chunk: Option<Chunk>, cache_time: u64) -> Response
where
    T: Serialize,
{
    let mut response = {
        if let Some(chunk) = chunk {
            Json(WrappedDataset {
                source: "https://satonomics.xyz",
                chunk,
                dataset: generic,
            })
            .into_response()
        } else {
            Json(generic).into_response()
        }
    };

    let headers = response.headers_mut();

    let max_age = cache_time;
    let stale_while_revalidate = 2 * max_age;

    headers.insert(header::ACCESS_CONTROL_ALLOW_ORIGIN, "*".parse().unwrap());
    headers.insert(header::ACCESS_CONTROL_ALLOW_HEADERS, "*".parse().unwrap());
    headers.insert(
        header::CACHE_CONTROL,
        format!(
            "public, max-age={max_age}, stale-while-revalidate={stale_while_revalidate}, stale-if-error={STALE_IF_ERROR}")
        .parse()
        .unwrap(),
    );
    headers.insert(header::CONTENT_TYPE, "application/json".parse().unwrap());

    response
}
