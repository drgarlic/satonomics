import { createLazyMemo } from "@solid-primitives/memo";

import { ONE_DAY_IN_MS } from "/src/scripts/utils";
import { createASS } from "/src/solid";

import { _createResourceDataset } from "../base";
import { createCommonDatasets } from "../common";
import { createPriceAveragesDatasets } from "./averages";
import { createCurrencyDatasets } from "./currencies";
import { createMarketCapitalizationDatasets } from "./marketcaps";

export { averages } from "./averages";

export function createDateDatasets() {
  const cachedPrice = createASS<DatasetCandlestickData[] | null>(null);

  const fetchedPrice = _createResourceDataset<
    "date",
    FetchedCandlestickData[],
    DatasetCandlestickData
  >({
    scale: "date",
    path: "/date-to-price",
    autoFetch: false,
    transform,
  });

  import("/src/assets/data/btcusd.json").then((candlesticks) => {
    cachedPrice.set(transform(candlesticks.default));

    fetchedPrice.url.searchParams.set(
      "since",
      (
        new Date(candlesticks.default.at(-1)?.date || 0).valueOf() / 1000
      ).toString(),
    );

    fetchedPrice.fetch();
  });

  const candlestick = createLazyMemo(() => [
    ...(cachedPrice() || []),
    ...(fetchedPrice.values() || []),
  ]);

  const price = {
    scale: "date" as const,
    values: candlestick,
    sources: fetchedPrice.sources,
    url: fetchedPrice.url,
  };

  const common = createCommonDatasets(price);

  return {
    price,
    ...common,
    ...createPriceAveragesDatasets(price),
    ...createMarketCapitalizationDatasets(common.marketCapitalization),
    ...createCurrencyDatasets(common.SupplyTotal),

    // sopr: createResourceHTTP(`/sopr`),
    // terminalPrice: createResourceHTTP(`/terminal-price`),
    // balancedPrice: createResourceHTTP(`/balanced-price`),
    // cointimePrice: createResourceHTTP(`/cointime-price`),
    // cvdd: createResourceHTTP(`/cvdd`),
    // fundingRates: createResourceHTTP(`/funding-rates`),
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
}

function transform(values: FetchedCandlestickData[] | null) {
  return (values || []).map((value) => ({
    ...value,
    number: new Date(value.date).valueOf() / ONE_DAY_IN_MS,
    value: value.close,
    time: value.date,
  }));
}
