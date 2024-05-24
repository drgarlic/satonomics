import { defaultSeriesOptions } from "/src/scripts";

export const createLineSeries = (
  chart: IChartApi,
  options?: DeepPartialLineOptions,
) =>
  chart.addLineSeries({
    ...defaultSeriesOptions,
    ...options,
  });
