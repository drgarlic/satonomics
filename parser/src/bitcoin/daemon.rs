use std::{process::Command, thread::sleep, time::Duration};

use serde_json::Value;

use crate::utils::{log, log_output};

struct BlockchainInfo {
    pub headers: u64,
    pub blocks: u64,
}

pub struct BitcoinDaemon<'a> {
    path: &'a str,
}

impl<'a> BitcoinDaemon<'a> {
    pub fn new(bitcoin_dir_path: &'a str) -> Self {
        Self {
            path: bitcoin_dir_path,
        }
    }

    pub fn start(&self) {
        sleep(Duration::from_secs(1));

        let mut command = Command::new("bitcoind");

        command
            .arg(self.datadir_arg())
            .arg("-blocksonly")
            .arg("-txindex=1")
            .arg("-daemon");

        // bitcoind -datadir=/Users/k/Developer/bitcoin -blocksonly -txindex=1 -daemon
        let output = command
            .output()
            .expect("bitcoind to be able to properly start");

        log_output(&output);
    }

    pub fn stop(&self) {
        // bitcoin-cli -datadir=/Users/k/Developer/bitcoin stop
        let output = Command::new("bitcoin-cli")
            .arg(self.datadir_arg())
            .arg("stop")
            .output()
            .unwrap();

        if output.status.success() {
            log_output(&output);

            sleep(Duration::from_secs(15));
        }
    }

    pub fn wait_sync(&self) {
        while !self.check_if_fully_synced() {
            sleep(Duration::from_secs(5))
        }
    }

    pub fn wait_for_new_block(&self, last_block_height: usize) {
        log("Waiting for new block...");

        while self.get_blockchain_info().headers as usize == last_block_height {
            sleep(Duration::from_secs(5))
        }
    }

    pub fn check_if_fully_synced(&self) -> bool {
        let BlockchainInfo { blocks, headers } = self.get_blockchain_info();

        let synced = blocks == headers;

        if synced {
            log(&format!("Synced ! ({blocks} blocks)"));
        } else {
            log(&format!("Syncing... ({} remaining)", headers - blocks));
        }

        synced
    }

    fn get_blockchain_info(&self) -> BlockchainInfo {
        loop {
            let res = self._get_blockchain_info();

            if let Ok(blockchain_info) = res {
                return blockchain_info;
            } else {
                sleep(Duration::from_secs(1));
            }
        }
    }

    fn _get_blockchain_info(&self) -> color_eyre::Result<BlockchainInfo> {
        // bitcoin-cli -datadir=/Users/k/Developer/bitcoin getblockchaininfo
        let output = Command::new("bitcoin-cli")
            .arg(self.datadir_arg())
            .arg("getblockchaininfo")
            .output()?;

        let output = String::from_utf8_lossy(&output.stdout);

        let json: Value = serde_json::from_str(&output)?;
        let json = json.as_object().unwrap();

        let blocks = json.get("blocks").unwrap().as_u64().unwrap();
        let headers = json.get("headers").unwrap().as_u64().unwrap();

        Ok(BlockchainInfo { headers, blocks })
    }

    fn datadir_arg(&self) -> String {
        format!("-datadir={}", self.path)
    }
}
