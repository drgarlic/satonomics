use crate::{
    bitcoin::sats_to_btc,
    datasets::AnyDataset,
    structs::{AnyBiMap, AnyDateMap, BiMap, DateMap},
    utils::{ONE_MONTH_IN_DAYS, ONE_WEEK_IN_DAYS, ONE_YEAR_IN_DAYS},
};

use super::{ComputeData, InsertData, MinInitialStates};

pub struct MiningDataset {
    min_initial_states: MinInitialStates,

    // Inserted
    pub coinbase: BiMap<f32>,
    pub fees: BiMap<f32>,
    pub subsidy: BiMap<f32>,
    pub subsidy_in_dollars: BiMap<f32>,
    pub blocks_mined: DateMap<usize>,
    pub last_subsidy: DateMap<f32>,
    pub last_subsidy_in_dollars: DateMap<f32>,

    // Computed
    pub cumulative_subsidy_in_dollars: BiMap<f32>,
    pub annualized_issuance: BiMap<f32>,
    pub yearly_inflation_rate: BiMap<f32>,
    pub blocks_mined_1w_sma: DateMap<f32>,
    pub blocks_mined_1m_sma: DateMap<f32>,
}

impl MiningDataset {
    pub fn import(parent_path: &str) -> color_eyre::Result<Self> {
        let f = |s: &str| format!("{parent_path}/{s}");

        let mut s = Self {
            min_initial_states: MinInitialStates::default(),

            blocks_mined: DateMap::new_bin(1, &f("blocks_mined")),
            coinbase: BiMap::new_bin(1, &f("coinbase")),
            fees: BiMap::new_bin(1, &f("fees")),

            subsidy: BiMap::_new_bin(1, &f("subsidy"), 5),
            subsidy_in_dollars: BiMap::new_bin(1, &f("subsidy_in_dollars")),
            cumulative_subsidy_in_dollars: BiMap::_new_bin(
                1,
                &f("cumulative_subsidy_in_dollars"),
                usize::MAX,
            ),

            annualized_issuance: BiMap::new_bin(1, &f("annualized_issuance")),
            yearly_inflation_rate: BiMap::_new_bin(1, &f("yearly_inflation_rate"), usize::MAX),

            last_subsidy: DateMap::new_bin(1, &f("last_subsidy")),
            last_subsidy_in_dollars: DateMap::new_bin(1, &f("last_subsidy_in_dollars")),

            blocks_mined_1w_sma: DateMap::new_bin(1, &f("blocks_mined_1w_sma")),
            blocks_mined_1m_sma: DateMap::new_bin(1, &f("blocks_mined_1m_sma")),
        };

        s.min_initial_states
            .consume(MinInitialStates::compute_from_dataset(&s));

        dbg!(&s.min_initial_states);

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
            ..
        }: &InsertData,
    ) {
        let coinbase = sats_to_btc(coinbase);

        self.coinbase.height.insert(height, coinbase);

        let sumed_fees = sats_to_btc(fees.iter().sum());

        self.fees.height.insert(height, sumed_fees);

        let subsidy = coinbase - sumed_fees;

        self.subsidy.height.insert(height, subsidy);

        let subsidy_in_dollars = subsidy * block_price;

        self.subsidy_in_dollars
            .height
            .insert(height, subsidy_in_dollars);

        if is_date_last_block {
            self.coinbase.date_insert_sum_range(date, date_blocks_range);

            self.fees.date_insert_sum_range(date, date_blocks_range);

            self.subsidy.date_insert_sum_range(date, date_blocks_range);

            self.subsidy_in_dollars
                .date_insert_sum_range(date, date_blocks_range);

            self.last_subsidy.insert(date, subsidy);

            self.last_subsidy_in_dollars
                .insert(date, subsidy_in_dollars);

            self.blocks_mined
                .insert(date, height + 1 - date_first_height);
        }
    }

    pub fn compute(
        &mut self,
        &ComputeData { heights, dates }: &ComputeData,
        circulating_supply: &mut BiMap<f32>,
    ) {
        self.cumulative_subsidy_in_dollars
            .multiple_insert_cumulative(heights, dates, &mut self.subsidy_in_dollars);

        self.annualized_issuance.multiple_insert_last_x_sum(
            heights,
            dates,
            &mut self.subsidy,
            ONE_YEAR_IN_DAYS,
        );

        self.yearly_inflation_rate.multiple_insert_divide(
            heights,
            dates,
            &mut self.annualized_issuance,
            circulating_supply,
        );

        self.blocks_mined_1w_sma.multiple_insert_simple_average(
            dates,
            &mut self.blocks_mined,
            ONE_WEEK_IN_DAYS,
        );

        self.blocks_mined_1m_sma.multiple_insert_simple_average(
            dates,
            &mut self.blocks_mined,
            ONE_MONTH_IN_DAYS,
        );
    }
}

impl AnyDataset for MiningDataset {
    fn get_min_initial_states(&self) -> &MinInitialStates {
        &self.min_initial_states
    }

    fn to_inserted_bi_map_vec(&self) -> Vec<&(dyn AnyBiMap + Send + Sync)> {
        vec![
            &self.coinbase,
            &self.fees,
            &self.subsidy,
            &self.subsidy_in_dollars,
        ]
    }

    fn to_inserted_mut_bi_map_vec(&mut self) -> Vec<&mut dyn AnyBiMap> {
        vec![
            &mut self.coinbase,
            &mut self.fees,
            &mut self.subsidy,
            &mut self.subsidy_in_dollars,
        ]
    }

    fn to_inserted_date_map_vec(&self) -> Vec<&(dyn AnyDateMap + Send + Sync)> {
        vec![
            &self.blocks_mined,
            &self.last_subsidy,
            &self.last_subsidy_in_dollars,
        ]
    }

    fn to_inserted_mut_date_map_vec(&mut self) -> Vec<&mut dyn AnyDateMap> {
        vec![
            &mut self.blocks_mined,
            &mut self.last_subsidy,
            &mut self.last_subsidy_in_dollars,
        ]
    }

    fn to_computed_bi_map_vec(&self) -> Vec<&(dyn AnyBiMap + Send + Sync)> {
        vec![
            &self.cumulative_subsidy_in_dollars,
            &self.annualized_issuance,
            &self.yearly_inflation_rate,
        ]
    }

    fn to_computed_mut_bi_map_vec(&mut self) -> Vec<&mut dyn AnyBiMap> {
        vec![
            &mut self.cumulative_subsidy_in_dollars,
            &mut self.annualized_issuance,
            &mut self.yearly_inflation_rate,
        ]
    }

    fn to_computed_date_map_vec(&self) -> Vec<&(dyn AnyDateMap + Send + Sync)> {
        vec![&self.blocks_mined_1w_sma, &self.blocks_mined_1m_sma]
    }

    fn to_computed_mut_date_map_vec(&mut self) -> Vec<&mut dyn AnyDateMap> {
        vec![&mut self.blocks_mined_1w_sma, &mut self.blocks_mined_1m_sma]
    }
}
