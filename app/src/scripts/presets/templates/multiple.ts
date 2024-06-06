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
} from "/src/scripts";

import { stringToId } from "../../utils/id";

export enum SeriesType {
  Normal,
  Based,
  Area,
  Histogram,
}

export function applyMultipleSeries<Scale extends ResourceScale>({
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
  chart: IChartApi;
  preset: Preset;
  priceDataset?: Dataset<Scale>;
  priceOptions?: PriceSeriesOptions;
  priceScaleOptions?: FullPriceScaleOptions;
  liveCandle?: Accessor<DatasetCandlestickData | null>;
  list?: (
    | {
        dataset: Dataset<ResourceScale>;
        // dataset: Dataset<Scale>;
        color?: string;
        colors?: undefined;
        seriesType: SeriesType.Based;
        title: string;
        options?: BaselineSeriesOptions;
        defaultVisible?: boolean;
        priceLine?: {
          value: number;
          color: string;
        };
      }
    // | {
    //     dataset: Dataset<ResourceScale>;
    //     // dataset: Dataset<Scale>;
    //     color: string;
    //     lineColor?: string;
    //     areaColor?: string;
    //     seriesType: SeriesType.Stacked;
    //     title: string;
    //     options?: BaselineSeriesOptions;
    //     defaultVisible?: boolean;
    //     priceLine?: {
    //       value: number;
    //       color: string;
    //     };
    //   }
    | {
        dataset: Dataset<ResourceScale>;
        // dataset: Dataset<Scale>;
        color?: string;
        colors?: string[];
        seriesType: SeriesType.Histogram;
        title: string;
        options?: DeepPartialHistogramOptions;
        priceLine?: undefined;
        defaultVisible?: boolean;
      }
    | {
        dataset: Dataset<ResourceScale>;
        // dataset: Dataset<Scale>;
        color: string;
        colors?: undefined;
        seriesType?: SeriesType.Normal | SeriesType.Area;
        title: string;
        options?: DeepPartialLineOptions;
        priceLine?: {
          value: number;
          color: string;
        };
        defaultVisible?: boolean;
      }
  )[];
  datasets: Datasets;
  presets: Presets;
  activeResources: Accessor<Set<ResourceDataset<any, any>>>;
}): PresetLegend {
  const { halved } = priceScaleOptions || {};

  const { legend: priceLegend } = applyPriceSeries({
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

  const legend: PresetLegend = [];

  // const isAnyBased = list.find(
  //   (config) => config.seriesType === SeriesType.Based,
  // );

  const isAnyArea = list.find(
    (config) => config.seriesType === SeriesType.Area,
  );

  const rightPriceScaleOptions = resetRightPriceScale(chart, {
    ...priceScaleOptions,
    ...(isAnyArea
      ? {
          scaleMargins: {
            bottom: 0,
          },
        }
      : {}),
  });

  // const stacked = list.flatMap((config) =>
  //   config.seriesType === SeriesType.Stacked ? [config] : [],
  // );

  // if (stacked.length) {
  //   const series = chart.addCustomSeries(new StackedAreaSeries(), {
  //     colors: stacked.map(({ color, lineColor, areaColor }) => ({
  //       line: lineColor || color,
  //       // area: `${color}11`,
  //       area: areaColor || color,
  //     })),
  //     lineWidth: 1,
  //     priceLineVisible: false,
  //     lastValueVisible: false,
  //   });

  //   stacked.forEach(({ title, color }) => {
  //     legend.push(
  //       createSeriesLegend({
  //         title,
  //         presetId: preset.id,
  //         color: () => color,
  //         series,
  //         id: stringToId(title),
  //       }),
  //     );
  //   });

  //   createEffect(() =>
  //     series.setData(
  //       (stacked.at(0)?.dataset.values() || []).map(({ time }, index) => ({
  //         time,
  //         values: stacked.map(
  //           ({ dataset }) => dataset.values()?.at(index)?.value,
  //         ),
  //       })),
  //     ),
  //   );
  // }

  [...list]
    .reverse()
    .forEach(
      ({
        dataset,
        color,
        colors,
        seriesType: type,
        title,
        options,
        priceLine,
        defaultVisible,
      }) => {
        let series: ISeriesApi<"Baseline" | "Line" | "Area" | "Histogram">;

        if (type === SeriesType.Based) {
          series = createBaseLineSeries(chart, {
            color,
            ...options,
          });
        } else if (type === SeriesType.Area) {
          series = createAreaSeries(chart, {
            color,
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

        legend.splice(
          0,
          0,
          createSeriesLegend({
            id: stringToId(title),
            presetId: preset.id,
            title,
            series,
            color: () => colors || color || DEFAULT_BASELINE_COLORS,
            defaultVisible,
          }),
        );

        createEffect(() => {
          series.setData(dataset?.values() || []);
        });
      },
    );

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

  return [priceLegend, ...legend];
}
