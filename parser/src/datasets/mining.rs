use bitcoin::Amount;

use crate::{
    bitcoin::TARGET_BLOCKS_PER_DAY,
    datasets::AnyDataset,
    structs::{AnyBiMap, AnyDateMap, AnyHeightMap, BiMap, DateMap},
    utils::{BYTES_IN_MB, ONE_MONTH_IN_DAYS, ONE_WEEK_IN_DAYS, ONE_YEAR_IN_DAYS},
    HeightMap,
};

use super::{ComputeData, InsertData, MinInitialStates};

pub struct MiningDataset {
    min_initial_states: MinInitialStates,

    // Inserted
    pub blocks_mined: DateMap<usize>,
    pub total_blocks_mined: DateMap<usize>,
    pub coinbase: BiMap<f64>,
    pub coinbase_in_dollars: BiMap<f32>,
    // pub cumulative_coinbase: BiMap<f32>,
    // pub cumulative_coinbase_in_dollars: BiMap<f32>,
    pub fees: BiMap<f64>,
    pub fees_in_dollars: BiMap<f32>,
    // pub cumulative_fees: BiMap<f32>,
    // pub cumulative_fees_in_dollars: BiMap<f32>,
    // Raw
    // pub average_fee_paid: BiMap<f32>,
    // pub max_fee_paid: BiMap<f32>,
    // pub _90th_percentile_fee_paid: BiMap<f32>,
    // pub _75th_percentile_fee_paid: BiMap<f32>,
    // pub median_fee_paid: BiMap<f32>,
    // pub _25th_percentile_fee_paid: BiMap<f32>,
    // pub _10th_percentile_fee_paid: BiMap<f32>,
    // pub min_fee_paid: BiMap<f32>,
    // sat/vB
    // pub average_fee_price: BiMap<f32>,
    // pub max_fee_price: BiMap<f32>,
    // pub _90th_percentile_fee_price: BiMap<f32>,
    // pub _75th_percentile_fee_price: BiMap<f32>,
    // pub median_fee_price: BiMap<f32>,
    // pub _25th_percentile_fee_price: BiMap<f32>,
    // pub _10th_percentile_fee_price: BiMap<f32>,
    // pub min_fee_price: BiMap<f32>,
    // -
    pub subsidy: BiMap<f64>,
    pub subsidy_in_dollars: BiMap<f32>,
    pub cumulative_subsidy: BiMap<f64>,
    // pub cumulative_subsidy_in_dollars: BiMap<f32>,
    pub cumulative_coinbase: BiMap<f64>,
    // pub cumulative_coinbase_in_dollars: BiMap<f32>,
    pub cumulative_fees: BiMap<f64>,
    // pub cumulative_fees_in_dollars: BiMap<f32>,
    pub last_coinbase: DateMap<f64>,
    pub last_coinbase_in_dollars: DateMap<f32>,
    pub last_fees: DateMap<f64>,
    pub last_fees_in_dollars: DateMap<f32>,
    pub last_subsidy: DateMap<f64>,
    pub last_subsidy_in_dollars: DateMap<f32>,
    pub difficulty: BiMap<f64>,
    pub block_size: HeightMap<f32>,   // in MB
    pub block_weight: HeightMap<f32>, // in MB
    pub block_vbytes: HeightMap<u64>,
    pub block_interval: HeightMap<u32>, // in ms

    // Computed
    pub cumulative_block_size: BiMap<f32>,
    pub cumulative_subsidy_in_dollars: BiMap<f32>,
    pub annualized_issuance: BiMap<f64>,
    pub yearly_inflation_rate: BiMap<f64>,
    pub blocks_mined_target: DateMap<f32>,
    pub blocks_mined_1w_sma: DateMap<f32>,
    pub blocks_mined_1m_sma: DateMap<f32>,
    pub hash_rate: DateMap<f32>,
    // pub fees_to_coinbase_ratio: BiMap<f32>,
    // pub subsidy_to_coinbase_ratio: BiMap<f32>,
    // pub miners_revenue: BiMap<f32>,
    // pub blocks_size: DateMap<f32>,
    // pub average_block_size: DateMap<f32>,
    // pub median_block_size: DateMap<f32>,
    // pub average_block_weight: DateMap<f32>,
    // pub median_block_weight: DateMap<f32>,
    // pub average_block_interval: DateMap<u32>,
    // pub median_block_interval: DateMap<u32>,
    // pub miners_revenue_in_dollars: BiMap<f32>,
    // pub hash_price: BiMap<f32>,
    // pub hash_price_30d_volatility: BiMap<f32>,
    // pub puell_multiple: BiMap<f32>, // <== dividing the daily issuance value of bitcoins (in USD) by the 365-day moving average of daily issuance value.
    // difficulty_adjustment
    // next_difficulty_adjustment
}

impl MiningDataset {
    pub fn import(parent_path: &str) -> color_eyre::Result<Self> {
        let f = |s: &str| format!("{parent_path}/{s}");

        let mut s = Self {
            min_initial_states: MinInitialStates::default(),

            total_blocks_mined: DateMap::new_bin(1, &f("total_blocks_mined")),
            blocks_mined: DateMap::new_bin(1, &f("blocks_mined")),
            coinbase: BiMap::new_bin(1, &f("coinbase")),
            coinbase_in_dollars: BiMap::new_bin(1, &f("coinbase_in_dollars")),
            cumulative_coinbase: BiMap::new_bin(1, &f("cumulative_coinbase")),
            fees: BiMap::new_bin(1, &f("fees")),
            fees_in_dollars: BiMap::new_bin(1, &f("fees_in_dollars")),
            cumulative_fees: BiMap::new_bin(1, &f("cumulative_fees")),
            subsidy: BiMap::_new_bin(1, &f("subsidy"), 5),
            subsidy_in_dollars: BiMap::new_bin(1, &f("subsidy_in_dollars")),
            cumulative_subsidy: BiMap::_new_bin(1, &f("cumulative_subsidy"), 5),
            cumulative_subsidy_in_dollars: BiMap::_new_bin(
                1,
                &f("cumulative_subsidy_in_dollars"),
                usize::MAX,
            ),

            annualized_issuance: BiMap::new_bin(1, &f("annualized_issuance")),
            yearly_inflation_rate: BiMap::_new_bin(1, &f("yearly_inflation_rate"), usize::MAX),

            last_subsidy: DateMap::new_bin(1, &f("last_subsidy")),
            last_subsidy_in_dollars: DateMap::new_bin(1, &f("last_subsidy_in_dollars")),
            last_coinbase: DateMap::new_bin(1, &f("last_coinbase")),
            last_coinbase_in_dollars: DateMap::new_bin(1, &f("last_coinbase_in_dollars")),
            last_fees: DateMap::new_bin(1, &f("last_fees")),
            last_fees_in_dollars: DateMap::new_bin(1, &f("last_fees_in_dollars")),

            blocks_mined_target: DateMap::new_bin(1, &f("blocks_mined_target")),
            blocks_mined_1w_sma: DateMap::new_bin(1, &f("blocks_mined_1w_sma")),
            blocks_mined_1m_sma: DateMap::new_bin(1, &f("blocks_mined_1m_sma")),

            difficulty: BiMap::new_bin(1, &f("difficulty")),
            block_size: HeightMap::new_bin(1, &f("block_size")),
            cumulative_block_size: BiMap::new_bin(1, &f("cumulative_block_size")),
            block_weight: HeightMap::new_bin(1, &f("block_weight")),
            block_vbytes: HeightMap::new_bin(1, &f("block_vbytes")),
            block_interval: HeightMap::new_bin(1, &f("block_interval")),

            hash_rate: DateMap::new_bin(1, &f("hash_rate")),
        };

        s.min_initial_states
            .consume(MinInitialStates::compute_from_dataset(&s));

        Ok(s)
    }

    pub fn insert(
        &mut self,
        &InsertData {
            date_first_height,
            height,
            coinbase,
            fees,
            date_blocks_range,
            is_date_last_block,
            block_price,
            date,
            difficulty,
            block_size,
            block_vbytes,
            block_weight,
            block_interval,
            ..
        }: &InsertData,
    ) {
        self.coinbase.height.insert(height, coinbase.to_btc());

        let coinbase_in_dollars = self
            .coinbase_in_dollars
            .height
            .insert(height, coinbase.to_btc() as f32 * block_price);

        let sumed_fees = Amount::from_sat(fees.iter().map(|amount| amount.to_sat()).sum());

        self.fees.height.insert(height, sumed_fees.to_btc());

        let sumed_fees_in_dollars = self
            .fees_in_dollars
            .height
            .insert(height, sumed_fees.to_btc() as f32 * block_price);

        let subsidy = coinbase - sumed_fees;
        self.subsidy.height.insert(height, subsidy.to_btc());

        let subsidy_in_dollars = self
            .subsidy_in_dollars
            .height
            .insert(height, subsidy.to_btc() as f32 * block_price);

        self.difficulty.height.insert(height, difficulty);

        self.block_size
            .insert(height, block_size as f32 / BYTES_IN_MB as f32);
        self.block_weight
            .insert(height, block_weight as f32 / BYTES_IN_MB as f32);
        self.block_vbytes.insert(height, block_vbytes);
        self.block_interval.insert(height, block_interval);

        if is_date_last_block {
            self.coinbase.date_insert_sum_range(date, date_blocks_range);

            self.coinbase_in_dollars
                .date_insert_sum_range(date, date_blocks_range);

            self.fees.date_insert_sum_range(date, date_blocks_range);

            self.fees_in_dollars
                .date_insert_sum_range(date, date_blocks_range);

            self.subsidy.date_insert_sum_range(date, date_blocks_range);

            self.subsidy_in_dollars
                .date_insert_sum_range(date, date_blocks_range);

            self.last_coinbase.insert(date, coinbase.to_btc());

            self.last_coinbase_in_dollars
                .insert(date, coinbase_in_dollars);

            self.last_subsidy.insert(date, subsidy.to_btc());

            self.last_subsidy_in_dollars
                .insert(date, subsidy_in_dollars);

            self.last_fees.insert(date, sumed_fees.to_btc());

            self.last_fees_in_dollars
                .insert(date, sumed_fees_in_dollars);

            let total_blocks_mined = self.total_blocks_mined.insert(date, height + 1);

            self.blocks_mined
                .insert(date, total_blocks_mined - date_first_height);

            self.difficulty.date.insert(date, difficulty);
        }
    }

    pub fn compute(
        &mut self,
        &ComputeData { heights, dates }: &ComputeData,
        circulating_supply: &mut BiMap<f64>,
        last_height: &mut DateMap<usize>,
    ) {
        self.cumulative_subsidy
            .multi_insert_cumulative(heights, dates, &mut self.subsidy);

        self.cumulative_fees
            .multi_insert_cumulative(heights, dates, &mut self.fees);

        self.cumulative_coinbase
            .multi_insert_cumulative(heights, dates, &mut self.coinbase);

        self.cumulative_subsidy_in_dollars.multi_insert_cumulative(
            heights,
            dates,
            &mut self.subsidy_in_dollars,
        );

        self.annualized_issuance.multi_insert_last_x_sum(
            heights,
            dates,
            &mut self.subsidy,
            ONE_YEAR_IN_DAYS,
        );

        self.yearly_inflation_rate.multi_insert_percentage(
            heights,
            dates,
            &mut self.annualized_issuance,
            circulating_supply,
        );

        self.blocks_mined_target
            .multiple_static_insert(dates, 144.0);

        self.blocks_mined_1w_sma.multi_insert_simple_average(
            dates,
            &mut self.blocks_mined,
            ONE_WEEK_IN_DAYS,
        );

        self.blocks_mined_1m_sma.multi_insert_simple_average(
            dates,
            &mut self.blocks_mined,
            ONE_MONTH_IN_DAYS,
        );

        self.cumulative_block_size
            .height
            .multi_insert_cumulative(heights, &mut self.block_size);

        dates.iter().for_each(|date| {
            self.cumulative_block_size.date.insert(
                *date,
                self.cumulative_block_size
                    .height
                    .get_or_import(&last_height.get_or_import(*date).unwrap()),
            );
        });

        // https://hashrateindex.com/blog/what-is-bitcoins-hashrate/
        dates.iter().for_each(|date| {
            let blocks_mined = self.blocks_mined.get_or_import(*date).unwrap() as f64;
            let difficulty = self.difficulty.date.get_or_import(*date).unwrap();
            let hash_rate =
                ((blocks_mined / TARGET_BLOCKS_PER_DAY as f64) * difficulty * 2.0_f64.powi(32))
                    / 600.0;

            self.hash_rate.insert(*date, hash_rate as f32);
        })
    }
}

impl AnyDataset for MiningDataset {
    fn get_min_initial_states(&self) -> &MinInitialStates {
        &self.min_initial_states
    }

    fn to_inserted_bi_map_vec(&self) -> Vec<&(dyn AnyBiMap + Send + Sync)> {
        vec![
            &self.coinbase,
            &self.coinbase_in_dollars,
            &self.fees,
            &self.fees_in_dollars,
            &self.subsidy,
            &self.subsidy_in_dollars,
            &self.difficulty,
        ]
    }

    fn to_inserted_mut_bi_map_vec(&mut self) -> Vec<&mut dyn AnyBiMap> {
        vec![
            &mut self.coinbase,
            &mut self.coinbase_in_dollars,
            &mut self.fees,
            &mut self.fees_in_dollars,
            &mut self.subsidy,
            &mut self.subsidy_in_dollars,
            &mut self.difficulty,
        ]
    }

    fn to_inserted_date_map_vec(&self) -> Vec<&(dyn AnyDateMap + Send + Sync)> {
        vec![
            &self.total_blocks_mined,
            &self.blocks_mined,
            &self.last_subsidy,
            &self.last_subsidy_in_dollars,
            &self.last_coinbase,
            &self.last_coinbase_in_dollars,
            &self.last_fees,
            &self.last_fees_in_dollars,
        ]
    }

    fn to_inserted_mut_date_map_vec(&mut self) -> Vec<&mut dyn AnyDateMap> {
        vec![
            &mut self.total_blocks_mined,
            &mut self.blocks_mined,
            &mut self.last_subsidy,
            &mut self.last_subsidy_in_dollars,
            &mut self.last_coinbase,
            &mut self.last_coinbase_in_dollars,
            &mut self.last_fees,
            &mut self.last_fees_in_dollars,
        ]
    }

    fn to_inserted_height_map_vec(&self) -> Vec<&(dyn AnyHeightMap + Send + Sync)> {
        vec![
            &self.block_size,
            &self.block_weight,
            &self.block_vbytes,
            &self.block_interval,
        ]
    }

    fn to_inserted_mut_height_map_vec(&mut self) -> Vec<&mut dyn AnyHeightMap> {
        vec![
            &mut self.block_size,
            &mut self.block_weight,
            &mut self.block_vbytes,
            &mut self.block_interval,
        ]
    }

    fn to_computed_bi_map_vec(&self) -> Vec<&(dyn AnyBiMap + Send + Sync)> {
        vec![
            &self.cumulative_coinbase,
            &self.cumulative_fees,
            &self.cumulative_subsidy,
            &self.cumulative_subsidy_in_dollars,
            &self.annualized_issuance,
            &self.yearly_inflation_rate,
            &self.cumulative_block_size,
        ]
    }

    fn to_computed_mut_bi_map_vec(&mut self) -> Vec<&mut dyn AnyBiMap> {
        vec![
            &mut self.cumulative_coinbase,
            &mut self.cumulative_fees,
            &mut self.cumulative_subsidy,
            &mut self.cumulative_subsidy_in_dollars,
            &mut self.annualized_issuance,
            &mut self.yearly_inflation_rate,
            &mut self.cumulative_block_size,
        ]
    }

    fn to_computed_date_map_vec(&self) -> Vec<&(dyn AnyDateMap + Send + Sync)> {
        vec![
            &self.blocks_mined_target,
            &self.blocks_mined_1w_sma,
            &self.blocks_mined_1m_sma,
            &self.hash_rate,
        ]
    }

    fn to_computed_mut_date_map_vec(&mut self) -> Vec<&mut dyn AnyDateMap> {
        vec![
            &mut self.blocks_mined_target,
            &mut self.blocks_mined_1w_sma,
            &mut self.blocks_mined_1m_sma,
            &mut self.hash_rate,
        ]
    }
}
