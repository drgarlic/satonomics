// export function createPriceAveragesDatasets(
//   price: Dataset<"date", DatasetCandlestickData>,
// ) {
//   type Datasets = Record<
//     `price${AverageName}MA${"" | RatioKey}`,
//     Dataset<"date">
//   >;

//   const partial: Partial<Datasets> = {};

//   averages.forEach(({ key: averageName, days }) => {
//     const averageDataset = createLazyAverageDataset(price, days);

//     const key = `price${averageName}MA` as const;

//     partial[key] = averageDataset;

//     appendRatioLazyDatasets<"date", typeof key>({
//       datasets: partial,
//       sourceDataset: averageDataset,
//       key,
//       price,
//     });
//   });

//   return partial as Datasets;
// }

export const averages = [
  { name: "1 Week", key: "1w", days: 7 },
  { name: "8 Days", key: "8d", days: 8 },
  { name: "13 Days", key: "13d", days: 13 },
  { name: "21 Days", key: "21d", days: 21 },
  { name: "1 Month", key: "1m", days: 30 },
  { name: "34 Days", key: "34d", days: 34 },
  { name: "55 Days", key: "55d", days: 55 },
  { name: "89 Days", key: "89d", days: 89 },
  { name: "144 Days", key: "144d", days: 144 },
  { name: "1 Year", key: "1y", days: 365 },
  { name: "2 Years", key: "2y", days: 2 * 365 },
  { name: "200 Weeks", key: "200w", days: 200 * 7 },
  { name: "4 Years", key: "4y", days: 4 * 365 },
] as const;

export const totalReturns = [
  { name: "1 Day", key: "1d" },
  { name: "1 Month", key: "1m" },
  { name: "6 Months", key: "6m" },
  { name: "1 Year", key: "1y" },
  { name: "2 Years", key: "2y" },
  { name: "3 Years", key: "3y" },
  { name: "4 Years", key: "4y" },
  { name: "6 Years", key: "6y" },
  { name: "8 Years", key: "8y" },
  { name: "10 Years", key: "10y" },
] as const;

export const compoundReturns = [{ name: "4 Years", key: "4y" }] as const;
