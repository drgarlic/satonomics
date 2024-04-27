use axum::{serve, Router};
use reqwest::Client;
use tokio::net::TcpListener;
use tower_http::compression::CompressionLayer;

mod kraken;
mod satonomics;
mod utils;

use kraken::*;
use satonomics::*;
use utils::*;

#[derive(Clone)]
pub struct AppState {
    client: Client,
    cache: Cache,
}

#[tokio::main]
async fn main() -> color_eyre::Result<()> {
    color_eyre::install()?;

    let compression_layer = CompressionLayer::new()
        .br(true)
        .deflate(true)
        .gzip(true)
        .zstd(true);

    let app_state = AppState {
        client: Client::new(),
        cache: Default::default(),
    };

    let router = Router::new();
    let router = add_kraken_routes(router);
    let router = add_satonomics_routes(router);

    let router = router
        .fallback(|| async { "Route not found" })
        .layer(compression_layer)
        .with_state(app_state.clone());

    let listener = TcpListener::bind("0.0.0.0:3111").await?;

    serve(listener, router).await?;

    Ok(())
}
