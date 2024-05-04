import { makeTimer } from "@solid-primitives/timer";

import {
  chartState,
  debounce,
  run,
  setMinMaxMarkers,
  writeURLParam,
} from "/src/scripts";

export const LOCAL_STORAGE_RANGE_KEY = "chart-range";
export const URL_PARAMS_RANGE_FROM_KEY = "from";
export const URL_PARAMS_RANGE_TO_KEY = "to";

const debouncedUpdateURLParams = debounce((range: LogicalRange | null) => {
  if (!range) return;

  writeURLParam(URL_PARAMS_RANGE_FROM_KEY, String(range.from));

  writeURLParam(URL_PARAMS_RANGE_TO_KEY, String(range.to));

  localStorage.setItem(LOCAL_STORAGE_RANGE_KEY, JSON.stringify(range));
}, 1000);

export function setTimeScale({
  scale,
  switchBetweenCandlestickAndLine,
  lowerOpacity,
  candlesticks,
  activeResources,
}: {
  scale: ResourceScale;
  switchBetweenCandlestickAndLine: boolean;
  candlesticks: DatasetValue<CandlestickData | SingleValueData>[];
  lowerOpacity: boolean;
  activeResources: Accessor<Set<ResourceDataset<any, any>>>;
}) {
  const debouncedCallback = debounce((range: LogicalRange | null) => {
    const { chart, priceSeries: series } = chartState;
    if (!chart || !series) return;

    if (switchBetweenCandlestickAndLine) {
      try {
        const seriesType = checkIfUpClose(chart, range);

        chartState.seriesType = seriesType || chartState.seriesType;

        if (
          (seriesType === "Candlestick" && series.seriesType() === "Line") ||
          (seriesType === "Line" && series.seriesType() === "Candlestick")
        ) {
          chart
            .timeScale()
            .unsubscribeVisibleLogicalRangeChange(debouncedCallback);

          chartState.reset?.();
        } else {
          setMinMaxMarkers({ scale, candlesticks, range, lowerOpacity });
        }
      } catch {}
    } else {
      setMinMaxMarkers({ scale, candlesticks, range, lowerOpacity });
    }
  }, 50);

  chartState.chart
    ?.timeScale()
    .subscribeVisibleLogicalRangeChange(debouncedCallback);

  if (chartState.range) {
    chartState.chart?.timeScale().setVisibleLogicalRange(chartState.range);
  }

  chartState.chart?.timeScale().subscribeVisibleTimeRangeChange((range) => {
    if (!range) return;

    if (typeof range.from === "string" && typeof range.to === "string") {
      const from = Number(range.from.split("-").shift());
      const to = Number(range.to.split("-").shift()) || from;

      let ids = Array.from({ length: to - from + 1 }, (_, i) => i + from);

      ids.forEach((id) => {
        activeResources().forEach((resource) => resource.fetch(id));
      });
    } else {
      console.log(range);
    }
  });

  makeTimer(
    () =>
      chartState.chart
        ?.timeScale()
        .subscribeVisibleLogicalRangeChange((range) => {
          debouncedUpdateURLParams(range);
          range = range || chartState.range;
          chartState.range = range;
        }),
    50,
    setTimeout,
  );
}

export function checkIfUpClose(chart: IChartApi, range?: LogicalRange | null) {
  const from = range?.from || 0;
  const to = range?.to || 0;
  const width = chart.timeScale().width();

  const difference = to - from;

  return width / difference >= 2.05
    ? "Candlestick"
    : width / difference <= 1.95
      ? "Line"
      : undefined;
}

export function getInitialRange(): LogicalRange | null {
  const urlParams = new URLSearchParams(window.location.search);

  const from = urlParams.get(URL_PARAMS_RANGE_FROM_KEY);
  const to = urlParams.get(URL_PARAMS_RANGE_TO_KEY);

  if (from && to) {
    return {
      from: Number(from),
      to: Number(to),
    } as LogicalRange;
  }

  return JSON.parse(
    localStorage.getItem(LOCAL_STORAGE_RANGE_KEY) || "null",
  ) as LogicalRange | null;
}
