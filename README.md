# SATONOMICS

## Description

Satonomics is a suite of tools that compute, distribute and display on-chain data. The generated datasets are very heterogeneous and can be used for many different purposes. In a nutshell, it's the FOSS and self-hostable version of [Glassnode](https://glassnode.com) and thus be a complimentary tool to [mempool.space](https://mempool.space).

- `parser`: The backbone of the project, it does most of the work by parsing and then computing datasets from the timechain.
- `server`: A small server which automatically creates routes to access through an API all created datasets.
- `app`: A web app which displays the generated datasets in various charts.

## Goals

- Stay Free and Open Source forever
- Have as many datasets and charts as possible
- Be verifiable unlike all other on-chain data websites
- Be self-hostable unlike all other on-chain data websites
- Be runnable on a machine with 8 GB RAM
  - 16 GB RAM is already possible right now
- Still being runnable 10 years from now
  - By not any external dependencies besides price APIs (which are and should be very common and easy to update)
  - By **NOT** doing address labelling/tagging, for that please use [mempool.space](https://mempool.space)

## Proof of Work

Aka: Previous iterations

The initial idea was totally different yet morphed over time into what it is today: a fully FOSS self-hostable on-chain data generator

- https://github.com/drgarlic/satonomics-parser
- https://github.com/drgarlic/satonomics-explorer
- https://github.com/drgarlic/satonomics-server
- https://github.com/drgarlic/satonomics-app
- https://github.com/drgarlic/bitalisys
- https://github.com/drgarlic/bitesque-app
- https://github.com/drgarlic/bitesque-back
- https://github.com/drgarlic/bitesque-front
- https://github.com/drgarlic/bitesque-assets
- https://github.com/drgarlic/syf
