import { LineStyle } from "lightweight-charts";

import { applyPriceSeries } from "../../lightweightCharts/chart/price";
import { createAreaSeries } from "../../lightweightCharts/series/creators/area";
import {
  createBaseLineSeries,
  DEFAULT_BASELINE_COLORS,
} from "../../lightweightCharts/series/creators/baseLine";
import { createHistogramSeries } from "../../lightweightCharts/series/creators/histogram";
import { createSeriesLegend } from "../../lightweightCharts/series/creators/legend";
import { createLineSeries } from "../../lightweightCharts/series/creators/line";
import { resetRightPriceScale } from "../../lightweightCharts/series/options/priceScale";
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
  activeResources,
}: {
  chart: IChartApi;
  preset: Preset;
  priceDataset?: Dataset<Scale>;
  priceOptions?: PriceSeriesOptions;
  priceScaleOptions?: FullPriceScaleOptions;
  liveCandle?: Accessor<DatasetCandlestickData | null>;
  list?: (
    | {
        dataset: Dataset<ResourceScale>;
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
    | {
        dataset: Dataset<ResourceScale>;
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

  const legendList: PresetLegend = [priceLegend];

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

        legendList.splice(
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

  return legendList;
}
