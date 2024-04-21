import { getInitialRange } from "./time";

export const chartState = {
  chart: null as IChartApi | null,
  priceSeries: null as ISeriesApi<"Candlestick" | "Line"> | null,
  priceLine: null as IPriceLine | null,
  seriesType: null as "Candlestick" | "Line" | null,
  range: getInitialRange(),
  reset: null as VoidFunction | null,
};
