import { LineStyle } from "lightweight-charts";

import {
  applyPriceSeries,
  createAreaSeries,
  createBaseLineSeries,
  createHistogramSeries,
  createLineSeries,
  createSeriesLegend,
  DEFAULT_BASELINE_COLORS,
  resetRightPriceScale,
  StackedAreaSeries,
} from "/src/scripts";

export enum SeriesType {
  Normal,
  Stacked,
  Based,
  Area,
  Histogram,
}

export const applyMultipleSeries = <Scale extends ResourceScale>({
  scale,
  chart,
  list = [],
  liveCandle,
  preset,
  priceScaleOptions,
  datasets,
  priceDataset,
  priceOptions,
  presets,
  activeResources,
}: {
  // TODO: Fix types
  // scale: Scale;
  scale: ResourceScale;
  chart: IChartApi;
  preset: Preset;
  priceDataset?: Dataset<Scale>;
  priceOptions?: PriceSeriesOptions;
  priceScaleOptions?: FullPriceScaleOptions;
  liveCandle?: Accessor<DatasetCandlestickData | null>;
  list?: (
    | {
        id: string;
        dataset: Dataset<ResourceScale>;
        // dataset: Dataset<Scale>;
        color?: string;
        colors?: undefined;
        seriesType: SeriesType.Based;
        showPriceLine?: boolean;
        title: string;
        options?: BaselineSeriesOptions;
        priceLine?: {
          value: number;
          color: string;
        };
      }
    | {
        id: string;
        dataset: Dataset<ResourceScale>;
        // dataset: Dataset<Scale>;
        color: string;
        lineColor?: string;
        areaColor?: string;
        seriesType: SeriesType.Stacked;
        title: string;
        options?: BaselineSeriesOptions;
        priceLine?: {
          value: number;
          color: string;
        };
      }
    | {
        id: string;
        dataset: Dataset<ResourceScale>;
        // dataset: Dataset<Scale>;
        color?: string;
        colors?: string[];
        showPriceLine?: boolean;
        seriesType: SeriesType.Histogram;
        title: string;
        options?: DeepPartialHistogramOptions;
        priceLine?: undefined;
      }
    | {
        id: string;
        dataset: Dataset<ResourceScale>;
        // dataset: Dataset<Scale>;
        color: string;
        colors?: undefined;
        showPriceLine?: boolean;
        seriesType?: SeriesType.Normal | SeriesType.Area;
        title: string;
        options?: DeepPartialLineOptions;
        priceLine?: {
          value: number;
          color: string;
        };
      }
  )[];
  datasets: Datasets;
  presets: Presets;
  activeResources: Accessor<Set<ResourceDataset<any, any>>>;
}): PresetLegend => {
  const { halved } = priceScaleOptions || {};

  const legend: PresetLegend = [];

  // const isAnyBased = list.find(
  //   (config) => config.seriesType === SeriesType.Based,
  // );

  const isAnyArea = list.find(
    (config) => config.seriesType === SeriesType.Area,
  );

  const isAnyStacked = list.find(
    (config) => config.seriesType === SeriesType.Stacked,
  );

  const rightPriceScaleOptions = resetRightPriceScale(chart, {
    ...priceScaleOptions,
    ...(isAnyStacked || isAnyArea
      ? {
          scaleMargins: {
            bottom: 0,
          },
        }
      : {}),
  });

  const stacked = list.flatMap((config) =>
    config.seriesType === SeriesType.Stacked ? [config] : [],
  );

  if (stacked.length) {
    const series = chart.addCustomSeries(new StackedAreaSeries(), {
      colors: stacked.map(({ color, lineColor, areaColor }) => ({
        line: lineColor || color,
        // area: `${color}11`,
        area: areaColor || color,
      })),
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    stacked.forEach(({ title, color, id }) => {
      legend.push(
        createSeriesLegend({
          title,
          presetId: preset.id,
          color: () => color,
          series,
          id,
        }),
      );
    });

    createEffect(() =>
      series.setData(
        (stacked.at(0)?.dataset.values() || []).map(({ time }, index) => ({
          time,
          values: stacked.map(
            ({ dataset }) => dataset.values()?.at(index)?.value,
          ),
        })),
      ),
    );
  }

  console.log(
    list.flatMap((config) =>
      config.seriesType !== SeriesType.Stacked ? [config] : [],
    ),
  );

  list
    .flatMap((config) =>
      config.seriesType !== SeriesType.Stacked ? [config] : [],
    )
    .forEach(
      ({
        id,
        dataset,
        color,
        colors,
        seriesType: type,
        showPriceLine: _showPriceLine,
        title,
        options,
        priceLine,
      }) => {
        let series: ISeriesApi<"Baseline" | "Line" | "Area" | "Histogram">;

        const showPriceLine = halved && (_showPriceLine || list.length === 1);

        if (type === SeriesType.Based) {
          series = createBaseLineSeries(chart, {
            color,
            showPriceLine,
            ...options,
          });
        } else if (type === SeriesType.Area) {
          series = createAreaSeries(chart, {
            color,
            showPriceLine,
            autoscaleInfoProvider: (getInfo: () => AutoscaleInfo | null) => {
              const info = getInfo();
              if (info) {
                info.priceRange.minValue = 0;
              }
              return info;
            },
            ...options,
          });
        } else if (type === SeriesType.Histogram) {
          series = createHistogramSeries(chart, {
            color,
            ...options,
          });
        } else {
          series = createLineSeries(chart, {
            color,
            showPriceLine,
            ...options,
          });
        }

        if (priceLine) {
          series.createPriceLine({
            price: priceLine.value,
            lineStyle: LineStyle.Solid,
            axisLabelVisible: false,
            ...priceLine,
          });
        }

        legend.push(
          createSeriesLegend({
            id,
            presetId: preset.id,
            title,
            series,
            color: () => colors || color || DEFAULT_BASELINE_COLORS,
          }),
        );

        createEffect(() => {
          series.setData(dataset?.values() || []);
        });
      },
    );

  const { legend: priceLegend } = applyPriceSeries({
    scale,
    chart,
    datasets,
    liveCandle,
    preset,
    dataset: priceDataset,
    activeResources,
    options: {
      ...priceOptions,
      halved,
    },
  });

  createEffect(() => {
    const options = {
      scaleMargins: {
        top: priceLegend.visible()
          ? rightPriceScaleOptions.scaleMargins.top
          : rightPriceScaleOptions.scaleMargins.bottom,
        bottom: rightPriceScaleOptions.scaleMargins.bottom,
      },
    };

    chart.priceScale("right").applyOptions(options);
  });

  return [priceLegend, ...legend.reverse()];
};
