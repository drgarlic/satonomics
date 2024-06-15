# Satonomics - Parser

## Run

```bash
# Install rustup
# Update ./run.sh with the path to your bitcoin folder
./run.sh
```

## Limitations

- Needs to stop the node to parse the files (at least for now)
- Needs a lot a disk space for various databases (~500 GB) while substantial it's much cheaper than RAM

## Guidelines

- Avoid floats as much as possible
  - **Only** use `WAmount.to_btc()` when inserting or computing inside a dataset. It is **very** expensive.
