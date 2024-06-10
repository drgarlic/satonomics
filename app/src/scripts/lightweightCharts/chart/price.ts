import { PriceScaleMode } from "lightweight-charts";

import { createRWS } from "/src/solid/rws";

import { colors, convertCandleToCandleColor } from "../../utils/colors";
import { setMinMaxMarkers } from "../series/addOns/markers";
import { createPriceLine } from "../series/addOns/priceLine";
import { createCandlesticksSeries } from "../series/creators/candlesticks";
import { createSeriesLegend } from "../series/creators/legend";
import { createLineSeries } from "../series/creators/line";
import { chartState } from "./state";
import { checkIfUpClose, setTimeScale } from "./time";

export const PRICE_SCALE_MOMENTUM_ID = "momentum";

export const applyPriceSeries = <
  Scale extends ResourceScale,
  T extends SingleValueData,
>({
  chart,
  datasets,
  liveCandle,
  preset,
  dataset,
  options,
  activeResources,
}: {
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
    chartState.seriesType ||
    checkIfUpClose(chart, chartState.range) ||
    "Candlestick";

  chartState.seriesType = seriesType;

  const lowerOpacity = options?.lowerOpacity || options?.halved || false;

  if (options?.halved) {
    options.seriesOptions = {
      ...options.seriesOptions,
      priceScaleId: "left",
    };
  }

  const color = createRWS<string | string[]>("");

  if (!dataset && seriesType === "Candlestick") {
    const [series, colors] = createCandlesticksSeries(chart, {
      ...options,
      // inverseColors: options?.inverseColors ?? priceMode === 'sats',
      lowerOpacity,
    });

    color.set(colors);

    chartState.priceSeries = series;

    createEffect(() =>
      series.setData(datasets[preset.scale].price.values() || []),
    );
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
      const data =
        dataset?.values() ||
        datasets[preset.scale].price.values() ||
        ([] as any);

      // console.log(data);

      series.setData(data);
    });
  }

  if (!lowerOpacity) {
    chartState.priceLine = createPriceLine(chartState.priceSeries);

    createEffect(() => {
      updateLastPriceValue(
        dataset?.values()?.at(-1) ||
          (preset.scale === "date" ? liveCandle?.() : null) ||
          datasets[preset.scale].price.values()?.at(-1) ||
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

  // setMinMaxMarkers({
  //   scale: preset.scale,
  //   candlesticks:
  //     dataset?.values() || datasets[preset.scale].price.values() || ([] as any),
  //   range: chartState.range,
  //   lowerOpacity,
  // });

  setTimeScale({
    scale: preset.scale,
    switchBetweenCandlestickAndLine: !dataset,
    candlesticks:
      dataset?.values() || datasets[preset.scale].price.values() || ([] as any),
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
