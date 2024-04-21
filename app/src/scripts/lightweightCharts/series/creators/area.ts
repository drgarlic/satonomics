import { defaultSeriesOptions, showedLastValueConfig } from "/src/scripts";

type AreaOptions = DeepPartial<AreaStyleOptions & SeriesOptionsCommon>;

export const createAreaSeries = (
  chart: IChartApi,
  options?: AreaOptions & {
    color?: string;
    showPriceLine?: boolean;
  },
) => {
  const { color } = options || {};

  // const fillColor = `${color}11`;
  const fillColor = color;

  const seriesOptions: AreaOptions = {
    // priceScaleId: 'left',
    ...defaultSeriesOptions,
    lineColor: color,
    topColor: fillColor,
    bottomColor: fillColor,
    ...(options?.showPriceLine ? showedLastValueConfig : {}),
    ...options,
  };

  const series = chart.addAreaSeries(seriesOptions);

  return series;
};
