import { defaultSeriesOptions, PRICE_SCALE_MOMENTUM_ID } from "/src/scripts";

type HistogramOptions = DeepPartial<
  HistogramStyleOptions & SeriesOptionsCommon
>;

export const createHistogramSeries = (
  chart: IChartApi,
  options?: HistogramOptions,
) => {
  const seriesOptions: HistogramOptions = {
    priceScaleId: "left",
    ...defaultSeriesOptions,
    ...options,
  };

  const series = chart.addHistogramSeries(seriesOptions);

  try {
    chart.priceScale(PRICE_SCALE_MOMENTUM_ID).applyOptions({
      scaleMargins: {
        top: 0.9,
        bottom: 0,
      },
    });
  } catch {}

  return series;
};
