import groupedKeysToPath from "/src/../../datasets/grouped_keys_to_url_path.json";

import { createResourceDataset } from "../base";
import { createCommonDatasets } from "../common";

// import { createPriceAveragesDatasets } from "./averages";

export { averages } from "./averages";

export function createDateDatasets({
  setActiveResources,
}: {
  setActiveResources: Setter<Set<ResourceDataset<any, any>>>;
}) {
  type Key = keyof typeof groupedKeysToPath.date;
  type ResourceData = ReturnType<typeof createResourceDataset<"date">>;

  const resourceDatasets = {} as Record<Exclude<Key, "ohlc">, ResourceData>;

  Object.keys(groupedKeysToPath.date).forEach(([_key, path]) => {
    const key = _key as Key;
    if (key !== "ohlc") {
      resourceDatasets[key] = createResourceDataset<"date">({
        scale: "date",
        path,
        setActiveResources,
      });
    }
  });

  const price = createResourceDataset<"date", OHLC>({
    scale: "date",
    path: "/date-to-ohlc",
    setActiveResources,
  });

  const common = createCommonDatasets({ price, setActiveResources });

  const datasets = {
    price,
    ...resourceDatasets,
    // ...common,
    // ...createPriceAveragesDatasets(price),

    // sopr: createResourceHTTP(`/sopr`),
    // terminalPrice: createResourceHTTP(`/terminal-price`),
    // balancedPrice: createResourceHTTP(`/balanced-price`),
    // cointimePrice: createResourceHTTP(`/cointime-price`),
    // cvdd: createResourceHTTP(`/cvdd`),
    // vddMultiple: createResourceHTTP(`/vdd-multiple`),

    // const satsPrice = createLazyDataset(
    //   createLazyMemo(() =>
    //     (candlesticks.values() || [])
    //       .map(convertNormalCandleToSatCandle)
    //       .filter(
    //         ({ open, high, low, close }) =>
    //           open !== Infinity &&
    //           high !== Infinity &&
    //           low !== Infinity &&
    //           close !== Infinity,
    //       ),
    //   ),
    //   [candlesticks.sources],
    // );

    // const minersRevenueInDollars = addAverages(
    //   createLazyDataset(() =>
    //     (resources.minersRevenueInBitcoin.values() || []).map(
    //       ({ date, time, value }) => ({
    //         date,
    //         time,
    //         value: value * (closesRecord.values()?.[date] || 1),
    //       }),
    //     ),
    //   ),
    // )

    // const localExtremes = createExtremeQuantilesDataset(() => [
    //   resources.oneMonthRealizedPrice.quantiles,
    //   resources.threeMonthsRealizedPrice.quantiles,
    //   resources.sthRealizedPrice.quantiles,
    //   resources.sixMonthsRealizedPrice.quantiles,
    //   closes30DMA.quantiles,
    //   closes7DMA.quantiles,
    // ])

    // const cycleExtremes = createExtremeQuantilesDataset(() => [
    //   resources.oneYearRealizedPrice.quantiles,
    //   resources.realizedPrice.quantiles,
    //   resources.twoYearsRealizedPrice.quantiles,
    //   resources.lthRealizedPrice.quantiles,
    //   resources.planktonRealizedPrice.quantiles,
    //   resources.shrimpsRealizedPrice.quantiles,
    //   resources.crabsRealizedPrice.quantiles,
    //   resources.fishRealizedPrice.quantiles,
    //   resources.sharksRealizedPrice.quantiles,
    //   resources.whalesRealizedPrice.quantiles,
    //   resources.humpbacksRealizedPrice.quantiles,
    //   resources.balancedPrice.quantiles,
    //   resources.trueMeanPrice.quantiles,
    //   resources.cointimePrice.quantiles,
    //   resources.vaultedPrice.quantiles,
    //   resources.cvdd.quantiles,
    //   closes365DMA.quantiles,
    //   resources.terminalPrice.quantiles,
    // ])

    // satsPrice,
    // satsPriceCloses: createLazyDataset(() =>
    //   convertCandlesticksToSingleValueDataset(satsPrice.values()),
    // ),
    // hashPrice: addAverages(
    //   createLazyDataset(() => {
    //     const hashRate = resources.hashRate.values() || []

    //     const minersRevenue = minersRevenueInDollars.values() || []
    //     const firstMinersRevenue = minersRevenue.at(0)

    //     if (!minersRevenue.length || !hashRate.length || !firstMinersRevenue)
    //       return []

    //     let offset = hashRate.findIndex(
    //       ({ date }) => date === firstMinersRevenue.date,
    //     )

    //     return minersRevenue.map(({ date, time, value }, index) => {
    //       const hashDate = hashRate.at(index + offset)?.date

    //       // TODO: Fill data on backend's side
    //       if (date !== hashDate) {
    //         offset += Math.ceil(
    //           (new Date(date).getTime() - new Date(hashDate || '').getTime()) /
    //             ONE_DAY_IN_MS,
    //         )
    //       }

    //       return {
    //         date,
    //         time,
    //         value: value / (hashRate.at(index + offset)?.value || 0),
    //       }
    //     })
    //   }),
    // ),
    // minersRevenueInDollars,
    // puellMultiple: addAverages(
    //   createLazyDataset(() => {
    //     const dailyDataset = minersRevenueInDollars.values() || []

    //     const yearlyDataset = computeYearlyMovingAverage(dailyDataset)

    //     return dailyDataset.map(({ date, time, value }, index) => {
    //       const yearlyValue = yearlyDataset[index].value

    //       return {
    //         date,
    //         time,
    //         value: value / yearlyValue,
    //       }
    //     })
    //   }),
    // ),
  };

  return datasets;
}
