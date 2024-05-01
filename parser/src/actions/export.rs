use std::thread;

use chrono::{Local, NaiveDate};

use crate::{databases::Databases, datasets::AllDatasets, states::States, utils::time};

pub struct ExportedData<'a> {
    pub databases: Option<&'a mut Databases>,
    pub datasets: &'a mut AllDatasets,
    pub date: NaiveDate,
    pub height: usize,
    pub states: Option<&'a States>,
}

pub fn export(
    ExportedData {
        databases,
        datasets,
        states,
        height,
        date,
    }: ExportedData,
) -> color_eyre::Result<()> {
    println!("{:?} - Saving... (Don't close !!)", Local::now());

    time("Total save time", || -> color_eyre::Result<()> {
        time("Datasets saved", || datasets.export())?;

        thread::scope(|s| {
            if let Some(databases) = databases {
                s.spawn(|| time("Databases saved", || databases.export(height, date)));
            }

            if let Some(states) = states {
                s.spawn(|| time("States saved", || states.export()));
            }
        });

        Ok(())
    })?;

    println!();

    Ok(())
}
