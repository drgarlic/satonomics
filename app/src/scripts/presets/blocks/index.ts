import { LineStyle } from "lightweight-charts";

import { applyMultipleSeries, colors, SeriesType } from "/src/scripts";

export function createPresets(scale: ResourceScale) {
  return {
    id: `${scale}-blocks`,
    name: "Blocks",
    tree: [
      {
        id: `${scale}-blocks-new`,
        icon: IconTablerCube,
        name: "New",
        title: "New Blocks",
        description: "",
        applyPreset(params) {
          return applyMultipleSeries({
            scale,
            ...params,
            priceScaleOptions: {
              halved: true,
            },
            list: [
              {
                id: "new-blocks",
                title: "New",
                color: colors.darkBitcoin,
                dataset: params.datasets[scale].newBlocks,
              },
              {
                id: "new-blocks",
                title: "30 Day Moving Average",
                color: colors.bitcoin,
                dataset: params.datasets[scale].newBlocks30dSMA,
              },
              {
                id: "target",
                title: "Target",
                color: colors.white,
                dataset: params.datasets[scale].value144,
                options: {
                  lineStyle: LineStyle.LargeDashed,
                },
              },
            ],
          });
        },
      },
      {
        id: `${scale}-blocks-total`,
        icon: IconTablerWall,
        name: "Total",
        title: "Total Blocks",
        description: "",
        applyPreset(params) {
          return applyMultipleSeries({
            scale,
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
                dataset: params.datasets[scale].blocksTotal,
              },
            ],
          });
        },
      },
    ],
  } satisfies PresetFolder;
}
