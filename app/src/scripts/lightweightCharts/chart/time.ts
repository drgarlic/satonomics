import { makeTimer } from "@solid-primitives/timer";

import { HEIGHT_CHUNK_SIZE } from "../../datasets";
import { getNumberOfDaysBetweenTwoDates } from "../../utils/date";
import { debounce } from "../../utils/debounce";
import { writeURLParam } from "../../utils/urlParams";
import { setMinMaxMarkers } from "../series/addOns/markers";
import { chartState } from "./state";

export const LOCAL_STORAGE_RANGE_KEY = "chart-range";
export const URL_PARAMS_RANGE_FROM_KEY = "from";
export const URL_PARAMS_RANGE_TO_KEY = "to";

const debouncedUpdateURLParams = debounce((range: TimeRange | null) => {
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
  const debouncedCallback = debounce((range: TimeRange | null) => {
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
            .unsubscribeVisibleTimeRangeChange(debouncedCallback);
          chartState.reset?.();
        } else {
          // setMinMaxMarkers({ scale, candlesticks, range, lowerOpacity });
        }
      } catch {}
    } else {
      // setMinMaxMarkers({ scale, candlesticks, range, lowerOpacity });
    }
  }, 50);

  chartState.chart
    ?.timeScale()
    .subscribeVisibleTimeRangeChange(debouncedCallback);

  if (chartState.range) {
    chartState.chart?.timeScale().setVisibleRange(chartState.range);
  }

  chartState.chart?.timeScale().subscribeVisibleTimeRangeChange((range) => {
    if (!range) return;

    let ids: number[] = [];

    if (typeof range.from === "string" && typeof range.to === "string") {
      const from = new Date(range.from).getUTCFullYear();
      const to = new Date(range.to).getUTCFullYear();

      ids = Array.from({ length: to - from + 1 }, (_, i) => i + from);
    } else {
      const from = Math.floor(Number(range.from) / HEIGHT_CHUNK_SIZE);
      const to = Math.floor(Number(range.to) / HEIGHT_CHUNK_SIZE);

      const length = to - from + 1;

      ids = Array.from({ length }, (_, i) => (from + i) * HEIGHT_CHUNK_SIZE);
    }

    ids.forEach((id) => {
      activeResources().forEach((resource) => resource.fetch(id));
    });
  });

  makeTimer(
    () =>
      chartState.chart?.timeScale().subscribeVisibleTimeRangeChange((range) => {
        debouncedUpdateURLParams(range);
        range = range || chartState.range;
        chartState.range = range;
      }),
    50,
    setTimeout,
  );
}

// function checkIfUpClose(chart: IChartApi, range?: TimeRange | null) {
//   const from = range?.from || 0;
//   const to = range?.to || 0;
//   const width = chart.timeScale().width();

//   const difference = to - from;

//   return width / difference >= 2 ? "Candlestick" : "Line";
// }

export function checkIfUpClose(chart: IChartApi, range?: TimeRange | null) {
  if (!range) return undefined;

  const from = new Date(range.from);
  const to = new Date(range.to);

  const width = chart.timeScale().width();

  const difference = getNumberOfDaysBetweenTwoDates(from, to);

  return width / difference >= 2.05
    ? "Candlestick"
    : width / difference <= 1.95
      ? "Line"
      : undefined;
}

export function getInitialRange(): TimeRange | null {
  const urlParams = new URLSearchParams(window.location.search);

  const from = urlParams.get(URL_PARAMS_RANGE_FROM_KEY);
  const to = urlParams.get(URL_PARAMS_RANGE_TO_KEY);

  if (from && to) {
    return {
      from,
      to,
    } satisfies TimeRange;
  }

  return JSON.parse(
    localStorage.getItem(LOCAL_STORAGE_RANGE_KEY) || "null",
  ) as TimeRange | null;
}
