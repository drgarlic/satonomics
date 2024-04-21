import {
  applyMultipleSeries,
  averages,
  colors,
  createRatioPresetFolder,
} from "/src/scripts";

export function createPresets(datasets: Datasets): PresetFolder {
  return {
    id: "averages",
    name: "Averages",
    tree: averages.map(({ name, key }) =>
      createPresetFolder({
        datasets,
        id: `${key.toLowerCase()}-sma`,
        color: colors[`closes${key}MA`],
        name,
        key,
      }),
    ),
  };
}

function createPresetFolder({
  datasets,
  id,
  color,
  name,
  key,
}: {
  datasets: Datasets;
  id: string;
  color: string;
  name: string;
  key: AverageName;
}): PresetFolder {
  return {
    id,
    name,
    tree: [
      {
        id: `${id}-value`,
        name: `Value`,
        description: "",
        icon: IconTablerMathAvg,
        title: `${name} Moving Average`,
        applyPreset(params) {
          return applyMultipleSeries({
            scale: "date",
            ...params,
            list: [
              {
                id,
                title: `${name} Moving Average`,
                color,
                dataset: params.datasets.date[`price${key}MA`],
              },
            ],
          });
        },
      },
      createRatioPresetFolder({
        datasets: datasets.date,
        scale: "date",
        id,
        color,
        title: `${name} Moving Average`,
        datasetKey: `price${key}MA`,
      }),
    ],
  };
}
