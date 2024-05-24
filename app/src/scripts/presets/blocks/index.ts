import { LineStyle } from "lightweight-charts";

import { applyMultipleSeries, colors, SeriesType } from "/src/scripts";

export function createPresets() {
  return {
    id: `date-blocks`,
    name: "Blocks",
    tree: [
      {
        id: `date-total-block-height`,
        icon: IconTablerWall,
        name: "Height",
        title: "Block Height",
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
                id: "height",
                title: "Height",
                color: colors.bitcoin,
                seriesType: SeriesType.Area,
                dataset: params.datasets.date.last_height,
              },
            ],
          });
        },
      },
      {
        id: `date-blocks-mined`,
        icon: IconTablerCube,
        name: "Mined",
        title: "Blocks Mined",
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
                id: "raw",
                title: "Mined",
                color: colors.darkBitcoin,
                dataset: params.datasets.date.blocks_mined,
              },
              {
                id: "30d",
                title: "Monthly Avg.",
                color: colors.bitcoin,
                dataset: params.datasets.date.blocks_mined_1m_sma,
              },
              {
                id: "1w",
                title: "Weekly Avg.",
                color: colors.momentumYellow,
                dataset: params.datasets.date.blocks_mined_1w_sma,
                defaultVisible: false,
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
        id: `date-total-blocks-mined`,
        icon: IconTablerWall,
        name: "Total Mined",
        title: "Total Blocks Mined",
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
                dataset: params.datasets.date.total_blocks_mined,
              },
            ],
          });
        },
      },
    ],
  } satisfies PresetFolder;
}
