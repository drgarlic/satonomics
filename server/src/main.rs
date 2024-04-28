use axum::{routing::get, serve, Router};
use tokio::net::TcpListener;
use tower_http::compression::CompressionLayer;

mod chunk;
mod handler;
mod imports;
mod kind;
mod response;

use handler::file_handler;

#[tokio::main]
async fn main() -> color_eyre::Result<()> {
    color_eyre::install()?;

    let compression_layer = CompressionLayer::new()
        .br(true)
        .deflate(true)
        .gzip(true)
        .zstd(true);

    let router = Router::new()
        .route("/*path", get(file_handler))
        .fallback(|| async { "Route not found" })
        .layer(compression_layer);

    let listener = TcpListener::bind("0.0.0.0:3111").await?;

    serve(listener, router).await?;

    Ok(())
}
