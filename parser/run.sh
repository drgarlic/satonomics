#!/usr/bin/env bash

# https://stackoverflow.com/questions/31389483/find-and-delete-file-or-folder-older-than-x-days

# For Mac OS users
if [ "$(uname)" == "Darwin" ]; then
    echo "Increasing limit of opened files..."
    ulimit -n $(ulimit -Hn)

    # Needed because the datasets tree is too big lol
    echo "Increasing stack size..."
    ulimit -s $(ulimit -Hs)

    if mdutil -s / | grep "enabled"; then
        echo "Disabling spotlight indexing..."
        sudo mdutil -a -i off &> /dev/null
    fi

    echo "Cleaning local TimeMachine snapshots..."
    # If not enough: tmutil thinlocalsnapshots / 500000000000 4
    tmutil thinlocalsnapshots / &> /dev/null
fi

# Update path
cargo run -r -- "$HOME/Developer/bitcoin"
