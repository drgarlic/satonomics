import { PriceScaleMode } from "lightweight-charts";

import {
  chartState,
  colors,
  convertCandleToCandleColor,
  createCandlesticksSeries,
  createLineSeries,
  createPriceLine,
  createSeriesLegend,
  setMinMaxMarkers,
  setTimeScale,
} from "/src/scripts";
import { createASS } from "/src/solid";

export const PRICE_SCALE_MOMENTUM_ID = "momentum";

export const applyPriceSeries = <
  Scale extends ResourceScale,
  T extends SingleValueData,
>({
  scale,
  chart,
  datasets,
  liveCandle,
  preset,
  dataset,
  options,
  activeResources,
}: {
  scale: Scale;
  chart: IChartApi;
  datasets: Datasets;
  preset: Preset;
  activeResources: Accessor<Set<ResourceDataset<any, any>>>;
  liveCandle?: Accessor<DatasetCandlestickData | null>;
  dataset?: Dataset<Scale, T>;
  options?: PriceSeriesOptions;
}): { legend: SeriesLegend } => {
  const id = options?.id || "price";
  const title = options?.title || "Price";

  const seriesType =
    chartState.seriesType || checkIfUpClose(chart, chartState.range);

  chartState.seriesType = seriesType;

  const lowerOpacity = options?.lowerOpacity || options?.halved || false;

  if (options?.halved) {
    options.seriesOptions = {
      ...options.seriesOptions,
      priceScaleId: "left",
    };
  }

  const color = createASS<string | string[]>("");

  if (!dataset && seriesType === "Candlestick" && preset.scale === "date") {
    const [series, colors] = createCandlesticksSeries(chart, {
      ...options,
      // inverseColors: options?.inverseColors ?? priceMode === 'sats',
      lowerOpacity,
    });

    color.set(colors);

    chartState.priceSeries = series;

    createEffect(() => series.setData(datasets[scale].price.values() || []));
  } else {
    color.set(lowerOpacity ? colors.darkWhite : colors.white);

    const series = createLineSeries(chart, {
      color: lowerOpacity ? colors.darkWhite : colors.white,
      ...options?.seriesOptions,
      lastValueVisible: false,
    });

    chartState.priceSeries = series;

    // TODO: fix types
    createEffect(() => {
      series.setData(
        dataset?.values() || datasets[scale].price.values() || ([] as any),
      );
    });
  }

  if (!lowerOpacity) {
    chartState.priceLine = createPriceLine(chartState.priceSeries);

    createEffect(() => {
      updateLastPriceValue(
        dataset?.values()?.at(-1) ||
          (scale === "date" ? liveCandle?.() : null) ||
          datasets[scale].price.values()?.at(-1) ||
          null,
      );
    });
  }

  chartState.priceSeries.priceScale().applyOptions({
    ...(options?.halved
      ? {
          scaleMargins: {
            top: 0.05,
            bottom: 0.55,
          },
        }
      : {}),
    ...(options?.id || options?.title
      ? {}
      : {
          mode: PriceScaleMode.Logarithmic,
        }),
    ...options?.priceScaleOptions,
  });

  setMinMaxMarkers({
    scale,
    candlesticks:
      dataset?.values() || datasets[scale].price.values() || ([] as any),
    range: chartState.range,
    lowerOpacity,
  });

  setTimeScale({
    scale,
    switchBetweenCandlestickAndLine: !dataset && scale === "date",
    candlesticks:
      dataset?.values() || datasets[scale].price.values() || ([] as any),
    lowerOpacity,
    activeResources,
  });

  return {
    legend: createSeriesLegend({
      id,
      presetId: preset.id,
      title,
      color,
      series: chartState.priceSeries,
    }),
  };
};

function checkIfUpClose(chart: IChartApi, range?: LogicalRange | null) {
  const from = range?.from || 0;
  const to = range?.to || 0;
  const width = chart.timeScale().width();

  const difference = to - from;

  return width / difference >= 2 ? "Candlestick" : "Line";
}

export function updateLastPriceValue(
  data: DatasetValue<CandlestickData | SingleValueData> | null,
) {
  if (!data || !chartState.chart) return;

  // const priceMode = chartState.priceMode
  // const isInGoldMode = priceMode === 'gold'
  // const isInSatsMode = priceMode === 'sats'
  const isInSatsMode = false;

  try {
    // const candlestick = isInSatsMode
    //   ? convertNormalCandleToSatCandle(candle)
    //   : isInGoldMode
    //     ? run(() => {
    //         const goldPrice = datasets.goldPrice.values()?.at(-1)?.value

    //         return goldPrice
    //           ? convertNormalCandleToGoldPerBitcoinCandle(candle, goldPrice)
    //           : undefined
    //       })
    //     : candle

    if (!data.value) return;

    chartState.priceSeries?.update(data);

    chartState.priceLine?.applyOptions({
      price: data.value,
      color:
        chartState.priceSeries?.seriesType() === "Candlestick" &&
        "close" in data
          ? convertCandleToCandleColor(data, isInSatsMode)
          : colors.white,
    });
  } catch {}
}
