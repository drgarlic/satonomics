import { LineStyle } from "lightweight-charts";

import { applyMultipleSeries, colors, SeriesType } from "/src/scripts";

export function createPresets() {
  return {
    id: `date-blocks`,
    name: "Blocks",
    tree: [
      {
        id: `date-blocks-new`,
        icon: IconTablerCube,
        name: "New",
        title: "New Blocks",
        description: "",
        applyPreset(params) {
          return applyMultipleSeries({
            scale: "date",
            ...params,
            priceScaleOptions: {
              halved: true,
            },
            list: [
              {
                id: "new-blocks",
                title: "New",
                color: colors.darkBitcoin,
                dataset: params.datasets.date.blocks_mined,
              },
              {
                id: "new-blocks",
                title: "30 Day Moving Average",
                color: colors.bitcoin,
                dataset: params.datasets.date.blocks_mined_1m_sma,
              },
              {
                id: "target",
                title: "Target",
                color: colors.white,
                dataset: params.datasets.date.blocks_mined_target,
                options: {
                  lineStyle: LineStyle.LargeDashed,
                },
              },
            ],
          });
        },
      },
      {
        id: `date-blocks-total`,
        icon: IconTablerWall,
        name: "Total",
        title: "Total Blocks",
        description: "",
        applyPreset(params) {
          return applyMultipleSeries({
            scale: "date",
            ...params,
            priceScaleOptions: {
              halved: true,
            },
            list: [
              {
                id: "total-blocks",
                title: "Total",
                color: colors.bitcoin,
                seriesType: SeriesType.Area,
                dataset: params.datasets.date.last_height,
              },
            ],
          });
        },
      },
    ],
  } satisfies PresetFolder;
}
