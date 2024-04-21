import { appendRatioLazyDatasets, createLazyAverageDataset } from "../base";

export function createPriceAveragesDatasets(
  price: Dataset<"date", DatasetCandlestickData>,
) {
  type Datasets = Record<
    `price${AverageName}MA${"" | RatioKey}`,
    Dataset<"date">
  >;

  const partial: Partial<Datasets> = {};

  averages.forEach(({ key: averageName, days }) => {
    const averageDataset = createLazyAverageDataset(price, days);

    const key = `price${averageName}MA` as const;

    partial[key] = averageDataset;

    appendRatioLazyDatasets<"date", typeof key>({
      datasets: partial,
      sourceDataset: averageDataset,
      key,
      price,
    });
  });

  return partial as Datasets;
}

export const averages = [
  { name: "7 Day", key: "7D" as const, days: 7 },
  { name: "30 Day", key: "30D" as const, days: 30 },
  { name: "111 Day", key: "111D" as const, days: 111 },
  { name: "200 Day", key: "200D" as const, days: 200 },
  { name: "1 Year", key: "1Y" as const, days: 365 },
  { name: "2 Year", key: "2Y" as const, days: 730 },
  { name: "4 Year", key: "4Y" as const, days: 1460 },
] as const;
