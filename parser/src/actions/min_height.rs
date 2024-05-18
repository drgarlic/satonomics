use crate::{
    databases::Databases,
    datasets::{AllDatasets, AnyDatasets, DateMetadataDataset, MinInitialState},
    states::States,
    structs::WNaiveDate,
};

#[derive(Default, Debug)]
pub struct Heights {
    pub inserted: usize,
    pub computed: usize,
}

impl Heights {
    pub fn min(&self) -> usize {
        self.inserted.min(self.computed)
    }
}

pub fn find_first_inserted_unsafe_height(
    states: &mut States,
    databases: &mut Databases,
    datasets: &AllDatasets,
) -> Heights {
    let min_initial_inserted_last_address_height = datasets
        .address
        .get_min_initial_states()
        .inserted
        .last_height
        .as_ref()
        .cloned();

    let min_initial_inserted_last_address_date = datasets
        .address
        .get_min_initial_states()
        .inserted
        .last_date
        .as_ref()
        .cloned();

    let usable_databases = databases.check_if_usable(
        min_initial_inserted_last_address_height,
        min_initial_inserted_last_address_date,
    );

    states
        .date_data_vec
        .iter()
        .last()
        .map(|date_data| date_data.date)
        .and_then(|last_safe_date| {
            if !usable_databases {
                println!("Unusable databases");

                return None;
            }

            let first_inserted_min_height = compare_min_initial_state_with_date_metadata(
                &datasets.get_min_initial_states().inserted,
                &last_safe_date,
                &datasets.date_metadata,
            );

            if let Some(first_inserted_min_height) = first_inserted_min_height {
                let first_computed_min_height = compare_min_initial_state_with_date_metadata(
                    &datasets.get_min_initial_states().computed,
                    &last_safe_date,
                    &datasets.date_metadata,
                );

                Some(Heights {
                    inserted: first_inserted_min_height,
                    computed: first_computed_min_height.unwrap_or_default(),
                })
            } else {
                None
            }

            // let min_datasets_inserted_last_height = datasets.get_min_initial_states().inserted.last_height;
            // let min_datasets_inserted_last_date = datasets.get_min_initial_states().inserted.last_date;

            // println!("min_datasets_inserted_last_height: {:?}", min_datasets_inserted_last_height);
            // println!("min_datasets_inserted_last_date: {:?}", min_datasets_inserted_last_date);

            // if min_datasets_inserted_last_date.map_or(true, |min_datasets_last_date| min_datasets_last_date < *last_safe_date) {
            //     dbg!(min_datasets_inserted_last_date , *last_safe_date);
            //     return None;
            // }

            // datasets
            //     .date_metadata
            //     .last_height
            //     ._get(&last_safe_date)
            //     .and_then(|last_safe_height| {
            //         if min_datasets_inserted_last_height.map_or(true, |min_datasets_inserted_last_height| min_datasets_inserted_last_height < last_safe_height) {
            //             println!("last_safe_height ({last_safe_height}) > min_datasets_height ({min_datasets_inserted_last_height:?})");

            //             None
            //         } else {
            //             Some(Sizes {
            //                 inserted: last_safe_height + 1,
            //                 computed: 0
            //             })
            //         }
            //     }
            // )
        })
        .unwrap_or_else(|| {
            println!("Starting over...");

            let include_addresses = !usable_databases
                || min_initial_inserted_last_address_date.is_none()
                || min_initial_inserted_last_address_height.is_none();

            if true {
                dbg!(include_addresses);
                panic!("");
            }

            states.reset(include_addresses);

            databases.reset(include_addresses);

            Heights::default()
        })
}

fn compare_min_initial_state_with_date_metadata(
    min_initial_state: &MinInitialState,
    last_safe_date: &WNaiveDate,
    date_metadata: &DateMetadataDataset,
) -> Option<usize> {
    let min_datasets_inserted_last_height = min_initial_state.last_height;
    let min_datasets_inserted_last_date = min_initial_state.last_date;

    println!(
        "min_datasets_inserted_last_height: {:?}",
        min_datasets_inserted_last_height
    );
    println!(
        "min_datasets_inserted_last_date: {:?}",
        min_datasets_inserted_last_date
    );

    if min_datasets_inserted_last_date.map_or(true, |min_datasets_last_date| {
        min_datasets_last_date < **last_safe_date
    }) {
        dbg!(min_datasets_inserted_last_date, *last_safe_date);
        return None;
    }

    date_metadata
        .last_height
        ._get(last_safe_date)
        .and_then(|last_safe_height| {
            if min_datasets_inserted_last_height.map_or(true, |min_datasets_inserted_last_height| min_datasets_inserted_last_height < last_safe_height) {
                println!("last_safe_height ({last_safe_height}) > min_datasets_height ({min_datasets_inserted_last_height:?})");

                None
            } else {
                Some(last_safe_height + 1)
            }
        }
    )
}
