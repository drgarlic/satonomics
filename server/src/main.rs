use std::sync::Arc;

use axum::{routing::get, serve, Router};
use generate::generate_paths_json_file;
use routes::{build_routes, Routes};
use serde::Serialize;
use tokio::net::TcpListener;
use tower_http::compression::CompressionLayer;

mod chunk;
mod generate;
mod handler;
mod imports;
mod kind;
mod response;
mod routes;

use handler::file_handler;

#[derive(Clone, Debug, Default, Serialize)]
pub struct Grouped<T> {
    pub date: T,
    pub height: T,
    pub last: T,
}

#[derive(Clone)]
pub struct AppState {
    routes: Arc<Routes>,
}

#[tokio::main]
async fn main() -> color_eyre::Result<()> {
    color_eyre::install()?;

    let routes = build_routes();

    generate_paths_json_file(&routes);

    let state = AppState {
        routes: Arc::new(routes),
    };

    let compression_layer = CompressionLayer::new()
        .br(true)
        .deflate(true)
        .gzip(true)
        .zstd(true);

    let router = Router::new()
        .route("/*path", get(file_handler))
        .with_state(state)
        .fallback(|| async { "Route not found" })
        .layer(compression_layer);

    let listener = TcpListener::bind("0.0.0.0:3111").await?;

    serve(listener, router).await?;

    Ok(())
}
