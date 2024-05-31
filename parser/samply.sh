ulimit -n 10000000

cargo build --profile profiling && samply record ./target/profiling/parser "$HOME/Developer/bitcoin"
