import { defaultSeriesOptions, showedLastValueConfig } from "/src/scripts";

export const createLineSeries = (
  chart: IChartApi,
  options?: DeepPartialLineOptions & { showPriceLine?: boolean },
) =>
  chart.addLineSeries({
    ...defaultSeriesOptions,
    ...(options?.showPriceLine ? showedLastValueConfig : {}),
    ...options,
  });
