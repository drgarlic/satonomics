# Satonomics - Parser

## Description

The backbone of the project, it does most of the work by parsing and then computing datasets from the timechain

## Requirements

- `rustup`

## Run

```bash
# Update ./run.sh with the path to your bitcoin folder
./run.sh
```

## Limitations

- Needs to stop the node to parse the files (at least for now)
- Needs a lot a disk space for various databases (~500 GB) while substantial it's much cheaper than RAM

## Guidelines

- Avoid floats as much as possible
  - Use structs like `WAmount` and `Price` for calculations
  - **Only** use `WAmount.to_btc()` when inserting or computing inside a dataset. It is **very** expensive.
