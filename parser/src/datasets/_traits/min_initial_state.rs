use chrono::NaiveDate;

use crate::structs::{AnyDateMap, AnyHeightMap};

use super::{AnyDataset, AnyDatasets};

#[derive(Default, Debug)]
pub struct MinInitialStates {
    pub inserted: MinInitialState,
    pub computed: MinInitialState,
}

impl MinInitialStates {
    pub fn consume(&mut self, other: Self) {
        self.inserted = other.inserted;
        self.computed = other.computed;
    }

    pub fn compute_from_dataset(dataset: &dyn AnyDataset) -> Self {
        Self {
            inserted: MinInitialState::compute_from_dataset(dataset, Mode::Inserted),
            computed: MinInitialState::compute_from_dataset(dataset, Mode::Computed),
        }
    }

    pub fn compute_from_datasets(datasets: &dyn AnyDatasets) -> Self {
        Self {
            inserted: MinInitialState::compute_from_datasets(datasets, Mode::Inserted),
            computed: MinInitialState::compute_from_datasets(datasets, Mode::Computed),
        }
    }
}

#[derive(Default, Debug)]
pub struct MinInitialState {
    pub first_unsafe_date: Option<NaiveDate>,
    pub first_unsafe_height: Option<usize>,
    pub last_date: Option<NaiveDate>,
    pub last_height: Option<usize>,
}

enum Mode {
    Inserted,
    Computed,
}

impl MinInitialState {
    // pub fn consume(&mut self, other: Self) {
    //     self.first_unsafe_date = other.first_unsafe_date;
    //     self.first_unsafe_height = other.first_unsafe_height;
    //     self.last_date = other.last_date;
    //     self.last_height = other.last_height;
    // }

    fn compute_from_datasets(datasets: &dyn AnyDatasets, mode: Mode) -> Self {
        match mode {
            Mode::Inserted => {
                let contains_date_maps = |dataset: &&(dyn AnyDataset + Sync + Send)| {
                    !dataset.to_all_inserted_date_map_vec().is_empty()
                };

                let contains_height_maps = |dataset: &&(dyn AnyDataset + Sync + Send)| {
                    !dataset.to_all_inserted_height_map_vec().is_empty()
                };

                Self {
                    first_unsafe_date: Self::min_datasets_date(
                        datasets,
                        contains_date_maps,
                        |dataset| {
                            dataset
                                .get_min_initial_states()
                                .inserted
                                .first_unsafe_date
                                .as_ref()
                                .cloned()
                        },
                    ),
                    first_unsafe_height: Self::min_datasets_height(
                        datasets,
                        contains_height_maps,
                        |dataset| {
                            dataset
                                .get_min_initial_states()
                                .inserted
                                .first_unsafe_height
                                .as_ref()
                                .cloned()
                        },
                    ),
                    last_date: Self::min_datasets_date(datasets, contains_date_maps, |dataset| {
                        dataset
                            .get_min_initial_states()
                            .inserted
                            .last_date
                            .as_ref()
                            .cloned()
                    }),
                    last_height: Self::min_datasets_height(
                        datasets,
                        contains_height_maps,
                        |dataset| {
                            dataset
                                .get_min_initial_states()
                                .inserted
                                .last_height
                                .as_ref()
                                .cloned()
                        },
                    ),
                }
            }
            Mode::Computed => {
                let contains_date_maps = |dataset: &&(dyn AnyDataset + Sync + Send)| {
                    !dataset.to_all_computed_date_map_vec().is_empty()
                };

                let contains_height_maps = |dataset: &&(dyn AnyDataset + Sync + Send)| {
                    !dataset.to_all_computed_height_map_vec().is_empty()
                };

                Self {
                    first_unsafe_date: Self::min_datasets_date(
                        datasets,
                        contains_date_maps,
                        |dataset| {
                            dataset
                                .get_min_initial_states()
                                .computed
                                .first_unsafe_date
                                .as_ref()
                                .cloned()
                        },
                    ),
                    first_unsafe_height: Self::min_datasets_height(
                        datasets,
                        contains_height_maps,
                        |dataset| {
                            dataset
                                .get_min_initial_states()
                                .computed
                                .first_unsafe_height
                                .as_ref()
                                .cloned()
                        },
                    ),
                    last_date: Self::min_datasets_date(datasets, contains_date_maps, |dataset| {
                        dataset
                            .get_min_initial_states()
                            .computed
                            .last_date
                            .as_ref()
                            .cloned()
                    }),
                    last_height: Self::min_datasets_height(
                        datasets,
                        contains_height_maps,
                        |dataset| {
                            dataset
                                .get_min_initial_states()
                                .computed
                                .last_height
                                .as_ref()
                                .cloned()
                        },
                    ),
                }
            }
        }
    }

    fn min_datasets_date(
        datasets: &dyn AnyDatasets,
        is_not_empty: impl Fn(&&(dyn AnyDataset + Sync + Send)) -> bool,
        map: impl Fn(&(dyn AnyDataset + Sync + Send)) -> Option<NaiveDate>,
    ) -> Option<NaiveDate> {
        Self::min_date(
            datasets
                .to_any_dataset_vec()
                .into_iter()
                .filter(is_not_empty)
                .map(map),
        )
    }

    fn min_datasets_height(
        datasets: &dyn AnyDatasets,
        is_not_empty: impl Fn(&&(dyn AnyDataset + Sync + Send)) -> bool,
        map: impl Fn(&(dyn AnyDataset + Sync + Send)) -> Option<usize>,
    ) -> Option<usize> {
        Self::min_height(
            datasets
                .to_any_dataset_vec()
                .into_iter()
                .filter(is_not_empty)
                .map(map),
        )
    }

    fn compute_from_dataset(dataset: &dyn AnyDataset, mode: Mode) -> Self {
        match mode {
            Mode::Inserted => {
                let date_vec = dataset.to_all_inserted_date_map_vec();
                let height_vec = dataset.to_all_inserted_height_map_vec();

                Self {
                    first_unsafe_date: Self::compute_min_initial_first_unsafe_date_from_dataset(
                        &date_vec,
                    ),
                    first_unsafe_height: Self::compute_min_initial_first_unsafe_height_from_dataset(
                        &height_vec,
                    ),
                    last_date: Self::compute_min_initial_last_date_from_dataset(&date_vec),
                    last_height: Self::compute_min_initial_last_height_from_dataset(&height_vec),
                }
            }
            Mode::Computed => {
                let date_vec = dataset.to_all_computed_date_map_vec();
                let height_vec = dataset.to_all_computed_height_map_vec();

                Self {
                    first_unsafe_date: Self::compute_min_initial_first_unsafe_date_from_dataset(
                        &date_vec,
                    ),
                    first_unsafe_height: Self::compute_min_initial_first_unsafe_height_from_dataset(
                        &height_vec,
                    ),
                    last_date: Self::compute_min_initial_last_date_from_dataset(&date_vec),
                    last_height: Self::compute_min_initial_last_height_from_dataset(&height_vec),
                }
            }
        }
    }

    #[inline(always)]
    fn compute_min_initial_last_date_from_dataset(
        arr: &[&(dyn AnyDateMap + Sync + Send)],
    ) -> Option<NaiveDate> {
        Self::min_date(arr.iter().map(|map| map.get_initial_last_date()))
    }

    #[inline(always)]
    fn compute_min_initial_last_height_from_dataset(
        arr: &[&(dyn AnyHeightMap + Sync + Send)],
    ) -> Option<usize> {
        Self::min_height(arr.iter().map(|map| map.get_initial_last_height()))
    }

    #[inline(always)]
    fn compute_min_initial_first_unsafe_date_from_dataset(
        arr: &[&(dyn AnyDateMap + Sync + Send)],
    ) -> Option<NaiveDate> {
        Self::min_date(arr.iter().map(|map| map.get_initial_first_unsafe_date()))
    }

    #[inline(always)]
    fn compute_min_initial_first_unsafe_height_from_dataset(
        arr: &[&(dyn AnyHeightMap + Sync + Send)],
    ) -> Option<usize> {
        Self::min_height(arr.iter().map(|map| map.get_initial_first_unsafe_height()))
    }

    #[inline(always)]
    fn min_date(iter: impl Iterator<Item = Option<NaiveDate>>) -> Option<NaiveDate> {
        iter.min().and_then(|opt| opt)
    }

    #[inline(always)]
    fn min_height(iter: impl Iterator<Item = Option<usize>>) -> Option<usize> {
        iter.min().and_then(|opt| opt)
    }
}
