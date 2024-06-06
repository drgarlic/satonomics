import {
  applyMultipleSeries,
  colors,
  createCohortPresetFolder,
  fromXToYCohorts,
  SeriesType,
  upToCohorts,
  xthCohorts,
  yearCohorts,
} from "/src/scripts";

export function createPresets({
  scale,
  datasets,
}: {
  scale: ResourceScale;
  datasets: Datasets;
}) {
  return {
    id: `${scale}-hodlers`,
    name: "Hodlers",
    tree: [
      {
        id: `${scale}-hodl-wave`,
        name: `Hodl Wave`,
        title: `Hodl Wave`,
        description: "",
        icon: IconTablerRipple,
        applyPreset(params) {
          return applyMultipleSeries({
            scale,
            ...params,
            priceScaleOptions: {
              halved: true,
            },
            list: [
              {
                id: "24h",
                title: `24h`,
                color: colors.upTo1d,
                seriesType: SeriesType.Stacked,
                dataset: params.datasets.date["upTo1dSupplyTotal%All"],
              },
              {
                id: "1d-1w",
                title: `1d to 1w`,
                color: colors.from1dTo1w,
                seriesType: SeriesType.Stacked,
                dataset: params.datasets.date["from1dTo1wSupplyTotal%All"],
              },
              {
                id: "1w-1m",
                title: `1w to 1m`,
                color: colors.from1wTo1m,
                seriesType: SeriesType.Stacked,
                dataset: params.datasets.date["from1wTo1mSupplyTotal%All"],
              },
              {
                id: "1m-3m",
                title: `1m to 3m`,
                color: colors.from1mTo3m,
                seriesType: SeriesType.Stacked,
                dataset: params.datasets.date["from1mTo3mSupplyTotal%All"],
              },
              {
                id: "3m-6m",
                title: `3m to 6m`,
                color: colors.from3mTo6m,
                seriesType: SeriesType.Stacked,
                dataset: params.datasets.date["from3mTo6mSupplyTotal%All"],
              },
              {
                id: "6m-1y",
                title: `6m to 1y`,
                color: colors.from6mTo1y,
                seriesType: SeriesType.Stacked,
                dataset: params.datasets.date["from6mTo1ySupplyTotal%All"],
              },
              {
                id: "1y-2y",
                title: `1y to 2y`,
                color: colors.from1yTo2y,
                seriesType: SeriesType.Stacked,
                dataset: params.datasets.date["from1yTo2ySupplyTotal%All"],
              },
              {
                id: "2y-3y",
                title: `2y to 3y`,
                color: colors.from2yTo3y,
                seriesType: SeriesType.Stacked,
                dataset: params.datasets.date["from2yTo3ySupplyTotal%All"],
              },
              {
                id: "3y-5y",
                title: `3y to 5y`,
                color: colors.from3yTo5y,
                seriesType: SeriesType.Stacked,
                dataset: params.datasets.date["from3yTo5ySupplyTotal%All"],
              },
              {
                id: "5y-7y",
                title: `5y to 7y`,
                color: colors.from5yTo7y,
                seriesType: SeriesType.Stacked,
                dataset: params.datasets.date["from5yTo7ySupplyTotal%All"],
              },
              {
                id: "7y-10y",
                title: `7y to 10y`,
                color: colors.from7yTo10y,
                seriesType: SeriesType.Stacked,
                dataset: params.datasets.date["from7yTo10ySupplyTotal%All"],
              },
              {
                id: "10y+",
                title: `10y+`,
                color: colors.from10yToEnd,
                seriesType: SeriesType.Stacked,
                dataset: params.datasets.date["from10yToEndSupplyTotal%All"],
              },
            ],
          });
        },
      },
      ...xthCohorts.map(({ key, name }) =>
        createCohortPresetFolder({
          datasets,
          scale,
          id: key,
          color: colors[key],
          name,
          datasetKey: key,
          title: name,
        }),
      ),
      {
        id: `${scale}-up-to-x`,
        name: "Up To X",
        tree: upToCohorts.map(({ key, name }) =>
          createCohortPresetFolder({
            datasets,
            scale,
            id: key,
            color: colors[key],
            name,
            datasetKey: key,
            title: name,
          }),
        ),
      },
      {
        id: `${scale}-from-x-to-y`,
        name: "From X To Y",
        tree: fromXToYCohorts.map(({ key, name }) =>
          createCohortPresetFolder({
            datasets,
            scale,
            id: key,
            color: colors[key],
            name,
            datasetKey: key,
            title: name,
          }),
        ),
      },
      {
        id: `${scale}-year`,
        name: "Years",
        tree: yearCohorts.map(({ key, name }) =>
          createCohortPresetFolder({
            datasets,
            scale,
            id: key,
            color: colors[key],
            name,
            datasetKey: key,
            title: name,
          }),
        ),
      },
    ],
  } satisfies PartialPresetFolder;
}
