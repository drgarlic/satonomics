import { LineStyle } from "lightweight-charts";

import {
  applyMultipleSeries,
  colors,
  createMomentumPresetFolder,
  createRatioPresetFolder,
  percentiles,
  SeriesType,
} from "/src/scripts";

export function createCohortPresetFolder<Scale extends ResourceScale>({
  datasets,
  scale,
  id,
  color,
  name,
  datasetKey,
  title,
}: {
  datasets: Datasets;
  scale: Scale;
  id: string;
  name: string;
  datasetKey: AnyPossibleCohortKey;
  color: string;
  title: string;
}): PresetFolder {
  return {
    id: `${scale}-cohort-${id}`,
    name,
    tree: createCohortPresetList({
      title,
      datasets,
      scale,
      color,
      datasetKey,
      id,
    }),
  };
}

export function createCohortPresetList<Scale extends ResourceScale>({
  datasets,
  scale,
  id,
  color,
  datasetKey,
  title,
}: {
  datasets: Datasets;
  scale: Scale;
  id: string;
  datasetKey: AnyPossibleCohortKey;
  title: string;
  color: string;
}): PresetTree {
  return [
    {
      id: `${scale}-${id}-utxos`,
      name: "UTXOs - Unspent Transaction Outputs",
      tree: [
        {
          id: `${scale}-${id}-utxo-count`,
          name: `Count`,
          title: `${title} UTXO Count`,
          icon: () => IconTablerTicket,
          applyPreset(params) {
            return applyMultipleSeries({
              scale,
              ...params,
              priceScaleOptions: {
                halved: true,
              },
              list: [
                {
                  id: "utxo-count",
                  title: "UTXO Count",
                  color,
                  seriesType: SeriesType.Area,
                  dataset: params.datasets[scale][`${datasetKey}_utxo`],
                },
              ],
            });
          },
          description: "",
        },
      ],
    },
    {
      id: `${scale}-${id}-realized`,
      name: "Realized",
      tree: [
        {
          id: `${scale}-${id}-realized-capitalization`,
          name: `Capitalization`,
          title: `${title} Realized Capitalization`,
          icon: () => IconTablerPigMoney,
          applyPreset(params) {
            return applyMultipleSeries({
              scale,
              ...params,
              priceScaleOptions: {
                halved: true,
              },
              list: [
                ...(id && id !== "all"
                  ? [
                      {
                        id: "realized-capitalization",
                        title: "Realized Capitalization",
                        color: colors.bitcoin,
                        dataset:
                          params.datasets[scale][`RealizedCapitalization`],
                      },
                    ]
                  : []),
                {
                  id: `${scale}-${id}-realized-capitalization`,
                  title: `${title} Realized Capitalization`,
                  color,
                  seriesType: SeriesType.Area,
                  dataset:
                    params.datasets[scale][
                      `${datasetKey}RealizedCapitalization`
                    ],
                },
              ],
            });
          },
          description: "",
        },
        {
          id: `${scale}-${id}-realized-capitalization-30d-change`,
          name: `Capitalization 30 Day Change`,
          title: `${title} Realized Capitalization 30 Day Change`,
          icon: () => IconTablerStatusChange,
          applyPreset(params) {
            return applyMultipleSeries({
              scale,
              ...params,
              priceScaleOptions: {
                halved: true,
              },
              list: [
                {
                  id: `${scale}-${id}-realized-capitalization-30d-change`,
                  title: `${title} Realized Cap. 30 Day Change`,
                  seriesType: SeriesType.Based,
                  dataset:
                    params.datasets[scale][
                      `${datasetKey}RealizedCapitalization30dChange`
                    ],
                },
              ],
            });
          },
          description: "",
        },
        {
          id: `${scale}-${id}-realized-price-folder`,
          name: "Price",
          tree: [
            {
              id: `${scale}-${id}-realized-price`,
              name: `Value`,
              title: `${title} Realized Price`,
              icon: () => IconTablerMathAvg,
              applyPreset(params) {
                return applyMultipleSeries({
                  scale,
                  ...params,
                  list: [
                    {
                      id: "realized-price",
                      title: "Realized Price",
                      color,
                      dataset:
                        params.datasets[scale][`${datasetKey}RealizedPrice`],
                    },
                  ],
                });
              },
              description: "",
            },
            createRatioPresetFolder({
              datasets: datasets[scale],
              scale,
              id: `${id}-realized-price`,
              color,
              title: `${title} Realized Price`,
              datasetKey: `${datasetKey}RealizedPrice`,
            }),
          ],
        },
        {
          id: `${scale}-${id}-realized-profit`,
          name: `Profit`,
          title: `${title} Realized Profit`,
          icon: () => IconTablerCash,
          applyPreset(params) {
            return applyMultipleSeries({
              scale,
              ...params,
              priceScaleOptions: {
                halved: true,
              },
              list: [
                {
                  id: "realized-profit",
                  title: "Realized Profit",
                  dataset:
                    params.datasets[scale][`${datasetKey}RealizedProfit`],
                  color: colors.profit,
                  seriesType: SeriesType.Area,
                },
              ],
            });
          },
          description: "",
        },
        {
          id: `${scale}-${id}-realized-loss`,
          name: "Loss",
          title: `${title} Realized Loss`,
          icon: () => IconTablerCoffin,
          applyPreset(params) {
            return applyMultipleSeries({
              scale,
              ...params,
              priceScaleOptions: {
                halved: true,
              },
              list: [
                {
                  id: "realized-loss",
                  title: "Realized Loss",
                  dataset: params.datasets[scale][`${datasetKey}RealizedLoss`],
                  color: colors.loss,
                  seriesType: SeriesType.Area,
                },
              ],
            });
          },
          description: "",
        },
        {
          id: `${scale}-${id}-realized-profit-and-loss`,
          name: `PNL - Profit And Loss`,
          title: `${title} PNL - Profit And Loss`,
          icon: () => IconTablerArrowsVertical,
          applyPreset(params) {
            return applyMultipleSeries({
              scale,
              ...params,
              priceScaleOptions: {
                halved: true,
              },
              list: [
                {
                  id: "realized-profit",
                  title: "Realized Profit",
                  color: colors.profit,
                  dataset:
                    params.datasets[scale][`${datasetKey}RealizedProfit`],
                  seriesType: SeriesType.Based,
                },
                {
                  id: "realized-loss",
                  title: "Realized Loss",
                  color: colors.loss,
                  dataset:
                    params.datasets[scale][`${datasetKey}RealizedLossNegative`],
                  seriesType: SeriesType.Based,
                },
              ],
            });
          },
          description: "",
        },
        {
          id: `${scale}-${id}-net-realized-profit-and-loss`,
          name: `Net PNL`,
          title: `${title} Net Realized Profit And Loss`,
          icon: () => IconTablerScale,
          applyPreset(params) {
            return applyMultipleSeries({
              scale,
              ...params,
              priceScaleOptions: {
                halved: true,
              },
              list: [
                {
                  id: "net-realized-profit-and-loss",
                  title: "Net PNL",
                  seriesType: SeriesType.Based,
                  dataset:
                    params.datasets[scale][
                      `${datasetKey}NetRealizedProfitAndLoss`
                    ],
                },
              ],
            });
          },
          description: "",
        },
        {
          id: `${scale}-${id}-relative-net-realized-profit-and-loss`,
          name: `Relative Net PNL`,
          title: `${title} Net Realized Profit And Loss Relative To Total Market Capitalization`,
          icon: () => IconTablerDivide,
          applyPreset(params) {
            return applyMultipleSeries({
              scale,
              ...params,
              priceScaleOptions: {
                halved: true,
              },
              list: [
                {
                  id: "relative-net-realized-profit-and-loss",
                  title: "Relative Net PNL",
                  seriesType: SeriesType.Based,
                  dataset:
                    params.datasets[scale][
                      `${datasetKey}RelativeNetRealizedProfitAndLoss`
                    ],
                },
              ],
            });
          },
          description: "",
        },
        {
          id: `${scale}-${id}-cumulative-realized-profit`,
          name: `Cumulative Profit`,
          title: `${title} Cumulative Realized Profit`,
          icon: () => IconTablerSum,
          applyPreset(params) {
            return applyMultipleSeries({
              scale,
              ...params,
              priceScaleOptions: {
                halved: true,
              },
              list: [
                {
                  id: "cumulative-realized-profit",
                  title: "Cumulative Realized Profit",
                  color: colors.profit,
                  seriesType: SeriesType.Area,
                  dataset:
                    params.datasets[scale][
                      `${datasetKey}CumulatedRealizedProfit`
                    ],
                },
              ],
            });
          },
          description: "",
        },
        {
          id: `${scale}-${id}-cumulative-realized-loss`,
          name: "Cumulative Loss",
          title: `${title} Cumulative Realized Loss`,
          icon: () => IconTablerSum,
          applyPreset(params) {
            return applyMultipleSeries({
              scale,
              ...params,
              priceScaleOptions: {
                halved: true,
              },
              list: [
                {
                  id: "cumulative-realized-loss",
                  title: "Cumulative Realized Loss",
                  color: colors.loss,
                  seriesType: SeriesType.Area,
                  dataset:
                    params.datasets[scale][
                      `${datasetKey}CumulatedRealizedLoss`
                    ],
                },
              ],
            });
          },
          description: "",
        },
        {
          id: `${scale}-${id}-cumulative-net-realized-profit-and-loss`,
          name: `Cumulative Net PNL`,
          title: `${title} Cumulative Net Realized Profit And Loss`,
          icon: () => IconTablerSum,
          applyPreset(params) {
            return applyMultipleSeries({
              scale,
              ...params,
              priceScaleOptions: {
                halved: true,
              },
              list: [
                {
                  id: "cumulative-net-realized-profit-and-loss",
                  title: "Cumulative Net Realized PNL",
                  seriesType: SeriesType.Based,
                  dataset:
                    params.datasets[scale][
                      `${datasetKey}CumulatedNetRealizedProfitAndLoss`
                    ],
                },
              ],
            });
          },
          description: "",
        },
        {
          id: `${scale}-${id}-cumulative-net-realized-profit-and-loss-30d-change`,
          name: `Cumulative Net PNL 30 Day Change`,
          title: `${title} Cumulative Net Realized Profit And Loss 30 Day Change`,
          icon: () => IconTablerTimeDuration30,
          applyPreset(params) {
            return applyMultipleSeries({
              scale,
              ...params,
              priceScaleOptions: {
                halved: true,
              },
              list: [
                {
                  id: "cumulative-net-realized-profit-and-loss-30d-change",
                  title: "Cumulative Net Realized PNL 30d Change",
                  dataset:
                    params.datasets[scale][
                      `${datasetKey}CumulatedNetRealizedProfitAndLoss30dChange`
                    ],
                  seriesType: SeriesType.Based,
                },
              ],
            });
          },
          description: "",
        },
      ],
    },
    {
      id: `${scale}-${id}-unrealized`,
      name: "Unrealized",
      tree: [
        {
          id: `${scale}-${id}-unrealized-profit`,
          name: `Profit`,
          title: `${title} Unrealized Profit`,
          icon: () => IconTablerMoodDollar,
          applyPreset(params) {
            return applyMultipleSeries({
              scale,
              ...params,
              priceScaleOptions: {
                halved: true,
              },
              list: [
                {
                  id: "unrealized-profit",
                  title: "Unrealized Profit",
                  dataset:
                    params.datasets[scale][`${datasetKey}UnrealizedProfit`],
                  color: colors.profit,
                  seriesType: SeriesType.Area,
                },
              ],
            });
          },
          description: "",
        },
        {
          id: `${scale}-${id}-unrealized-loss`,
          name: "Loss",
          title: `${title} Unrealized Loss`,
          icon: () => IconTablerMoodSadDizzy,
          applyPreset(params) {
            return applyMultipleSeries({
              scale,
              ...params,
              priceScaleOptions: {
                halved: true,
              },
              list: [
                {
                  id: "unrealized-loss",
                  title: "Unrealized Loss",
                  dataset:
                    params.datasets[scale][`${datasetKey}UnrealizedLoss`],
                  color: colors.loss,
                  seriesType: SeriesType.Area,
                },
              ],
            });
          },
          description: "",
        },
        {
          id: `${scale}-${id}-unrealized-profit-and-loss`,
          name: `PNL - Profit And Loss`,
          title: `${title} Unrealized PNL - Profit And Loss`,
          icon: () => IconTablerArrowsVertical,
          applyPreset(params) {
            return applyMultipleSeries({
              scale,
              ...params,
              priceScaleOptions: {
                halved: true,
              },
              list: [
                {
                  id: "unrealized-loss",
                  title: "Unrealized Profit",
                  color: colors.profit,
                  dataset:
                    params.datasets[scale][`${datasetKey}UnrealizedProfit`],
                  seriesType: SeriesType.Based,
                },
                {
                  id: "unrealized-loss",
                  title: "Unrealized Loss",
                  color: colors.loss,
                  dataset:
                    params.datasets[scale][
                      `${datasetKey}UnrealizedLossNegative`
                    ],
                  seriesType: SeriesType.Based,
                },
              ],
            });
          },
          description: "",
        },
        {
          id: `${scale}-${id}-net-unrealized-profit-and-loss`,
          name: `Net PNL`,
          title: `${title} Net Unrealized Profit And Loss`,
          icon: () => IconTablerScale,
          applyPreset(params) {
            return applyMultipleSeries({
              scale,
              ...params,
              priceScaleOptions: {
                halved: true,
              },
              list: [
                {
                  id: "net-unrealized-profit-and-loss",
                  title: "Net Unrealized PNL",
                  dataset:
                    params.datasets[scale][
                      `${datasetKey}NetUnrealizedProfitAndLoss`
                    ],
                  seriesType: SeriesType.Based,
                },
              ],
            });
          },
          description: "",
        },
        {
          id: `${scale}-${id}-relative-net-unrealized-profit-and-loss`,
          name: `Relative Net PNL`,
          title: `${title} Net Unrealized Profit And Loss Relative To Total Market Capitalization`,
          icon: () => IconTablerDivide,
          applyPreset(params) {
            return applyMultipleSeries({
              scale,
              ...params,
              priceScaleOptions: {
                halved: true,
              },
              list: [
                {
                  id: "relative-net-unrealized-profit-and-loss",
                  title: "Relative Net Unrealized PNL",
                  dataset:
                    params.datasets[scale][
                      `${datasetKey}RelativeNetUnrealizedProfitAndLoss`
                    ],
                  seriesType: SeriesType.Based,
                },
              ],
            });
          },
          description: "",
        },
      ],
    },
    {
      id: `${scale}-${id}-supply-total`,
      name: "Supply",
      tree: [
        {
          id: `${scale}-${id}-supply`,
          name: "Total",
          tree: [
            {
              id: `${scale}-${id}-total-supply-absolute`,
              name: `Absolute`,
              title: `${title} Total supply`,
              icon: () => IconTablerSum,
              applyPreset(params) {
                return applyMultipleSeries({
                  scale,
                  ...params,
                  priceScaleOptions: {
                    halved: true,
                  },
                  list: [
                    {
                      id: "supply-total",
                      title: "Total supply",
                      color,
                      seriesType: SeriesType.Area,
                      dataset:
                        params.datasets[scale][`${datasetKey}SupplyTotal`],
                    },
                  ],
                });
              },
              description: "",
            },
            {
              id: `${scale}-${id}-total-supply-percentage-all`,
              name: `% All`,
              title: `${title} Total supply (% All)`,
              icon: () => IconTablerPercentage,
              applyPreset(params) {
                return applyMultipleSeries({
                  scale,
                  ...params,
                  priceScaleOptions: {
                    halved: true,
                  },
                  list: [
                    {
                      id: "supply-total",
                      title: "Total supply",
                      color,
                      seriesType: SeriesType.Area,
                      dataset:
                        params.datasets[scale][`${datasetKey}SupplyTotal%All`],
                    },
                  ],
                });
              },
              description: "",
            },
          ],
        },
        {
          id: `${scale}-${id}-supply-in-profit`,
          name: "In Profit",
          tree: [
            {
              id: `${scale}-${id}-in-profit-absolute`,
              name: "Absolute",
              title: `${title} Supply in profit`,
              icon: () => IconTablerTrendingUp,
              applyPreset(params) {
                return applyMultipleSeries({
                  scale,
                  ...params,
                  priceScaleOptions: {
                    halved: true,
                  },
                  list: [
                    {
                      id: "supply-in-profit",
                      title: "Supply in profit",
                      color: colors.profit,
                      seriesType: SeriesType.Area,
                      dataset:
                        params.datasets[scale][`${datasetKey}SupplyInProfit`],
                    },
                  ],
                });
              },
              description: "",
            },
            {
              id: `${scale}-${id}-in-profit-percentage-self`,
              name: "% Self",
              title: `${title} Supply in profit (% Self)`,
              icon: () => IconTablerPercentage,
              applyPreset(params) {
                return applyMultipleSeries({
                  scale,
                  ...params,
                  priceScaleOptions: {
                    halved: true,
                  },
                  list: [
                    {
                      id: "supply-in-profit",
                      title: "Supply in profit",
                      color: colors.profit,
                      seriesType: SeriesType.Area,
                      dataset:
                        params.datasets[scale][
                          `${datasetKey}SupplyInProfit%Self`
                        ],
                    },
                  ],
                });
              },
              description: "",
            },
            {
              id: `${scale}-${id}-in-profit-percentage-all`,
              name: "% All",
              title: `${title} Supply in profit (% All)`,
              icon: () => IconTablerPercentage,
              applyPreset(params) {
                return applyMultipleSeries({
                  scale,
                  ...params,
                  priceScaleOptions: {
                    halved: true,
                  },
                  list: [
                    {
                      id: "supply-in-profit",
                      title: "Supply in profit",
                      color: colors.profit,
                      seriesType: SeriesType.Area,
                      dataset:
                        params.datasets[scale][
                          `${datasetKey}SupplyInProfit%All`
                        ],
                    },
                  ],
                });
              },
              description: "",
            },
          ],
        },
        {
          id: `${scale}-${id}-supply-in-loss`,
          name: "In Loss",
          tree: [
            {
              id: `${scale}-${id}-in-loss`,
              name: "Absolute",
              title: `${title} Supply in loss`,
              icon: () => IconTablerTrendingDown,
              applyPreset(params) {
                return applyMultipleSeries({
                  scale,
                  ...params,
                  priceScaleOptions: {
                    halved: true,
                  },
                  list: [
                    {
                      id: "supply-in-loss",
                      title: "Supply in loss",
                      color: colors.loss,
                      seriesType: SeriesType.Area,
                      dataset:
                        params.datasets[scale][`${datasetKey}SupplyInLoss`],
                    },
                  ],
                });
              },
              description: "",
            },
            {
              id: `${scale}-${id}-in-loss-percentage-self`,
              name: "% Self",
              title: `${title} Supply in loss (% Self)`,
              icon: () => IconTablerPercentage,
              applyPreset(params) {
                return applyMultipleSeries({
                  scale,
                  ...params,
                  priceScaleOptions: {
                    halved: true,
                  },
                  list: [
                    {
                      id: "supply-in-loss",
                      title: "Supply in loss",
                      seriesType: SeriesType.Area,
                      color: colors.loss,
                      dataset:
                        params.datasets[scale][
                          `${datasetKey}SupplyInLoss%Self`
                        ],
                    },
                  ],
                });
              },
              description: "",
            },
            {
              id: `${scale}-${id}-in-loss-percentage-all`,
              name: "% All",
              title: `${title} Supply in loss (% All)`,
              icon: () => IconTablerPercentage,
              applyPreset(params) {
                return applyMultipleSeries({
                  scale,
                  ...params,
                  priceScaleOptions: {
                    halved: true,
                  },
                  list: [
                    {
                      id: "supply-in-loss",
                      title: "Supply in loss",
                      seriesType: SeriesType.Area,
                      color: colors.loss,
                      dataset:
                        params.datasets[scale][`${datasetKey}SupplyInLoss%All`],
                    },
                  ],
                });
              },
              description: "",
            },
          ],
        },
        {
          id: `${scale}-${id}-supply-in-profit-and-loss`,
          name: "In PNL - Profit And Loss",
          tree: [
            {
              id: `${scale}-${id}-profit-and-loss-absolute`,
              name: "Absolute",
              tree: [
                {
                  id: `${scale}-${id}-profit-and-loss-absolute-crossed`,
                  name: "Crossed",
                  title: `${title} Profit And Loss (Crossed, Absolute)`,
                  icon: () => IconTablerArrowsCross,
                  applyPreset(params) {
                    return applyMultipleSeries({
                      scale,
                      ...params,
                      priceScaleOptions: {
                        halved: true,
                      },
                      list: [
                        {
                          id: "supply-total",
                          title: "Total supply",
                          color: colors.white,
                          dataset:
                            params.datasets[scale][`${datasetKey}SupplyTotal`],
                          options: {
                            lastValueVisible: false,
                          },
                        },
                        {
                          id: "supply-total-halved",
                          title: "Halved Total Supply",
                          color: colors.gray,
                          dataset:
                            params.datasets[scale][
                              `${datasetKey}SupplyTotal50Percent`
                            ],
                          options: {
                            lineStyle: LineStyle.SparseDotted,
                            lastValueVisible: false,
                          },
                        },
                        {
                          id: "supply-in-profit",
                          title: "Supply in profit",
                          color: colors.profit,
                          showPriceLine: true,
                          dataset:
                            params.datasets[scale][
                              `${datasetKey}SupplyInProfit`
                            ],
                        },
                        {
                          id: "supply-in-loss",
                          title: "Supply in loss",
                          color: colors.loss,
                          showPriceLine: true,
                          dataset:
                            params.datasets[scale][`${datasetKey}SupplyInLoss`],
                        },
                      ],
                    });
                  },
                  description: "",
                },
                {
                  id: `${scale}-${id}-stacked-profit-and-loss-absolute-stacked`,
                  name: "Stacked",
                  title: `${title} Profit And Loss (Stacked, Absolute)`,
                  icon: () => IconTablerStack,
                  applyPreset(params) {
                    return applyMultipleSeries({
                      scale,
                      ...params,
                      priceScaleOptions: {
                        halved: true,
                      },
                      list: [
                        {
                          id: "supply-total-halved",
                          title: "Halved Total Supply",
                          color: colors.gray,
                          dataset:
                            params.datasets[scale][
                              `${datasetKey}SupplyTotal50Percent`
                            ],
                          options: {
                            lineStyle: LineStyle.SparseDotted,
                          },
                        },
                        {
                          id: "supply-in-loss",
                          title: "Supply in loss",
                          color: colors.loss,
                          seriesType: SeriesType.Stacked,
                          dataset:
                            params.datasets[scale][`${datasetKey}SupplyInLoss`],
                        },
                        {
                          id: "supply-in-profit",
                          title: "Supply in profit",
                          seriesType: SeriesType.Stacked,
                          color: colors.profit,
                          dataset:
                            params.datasets[scale][
                              `${datasetKey}SupplyInProfit`
                            ],
                        },
                      ],
                    });
                  },
                  description: "",
                },
              ],
            },
            {
              id: `${scale}-${id}-supply-in-profit-and-loss-percentage-all`,
              name: "% All",
              tree: [
                {
                  id: `${scale}-${id}-profit-and-loss-percentage-all-crossed`,
                  name: "Crossed",
                  title: `${title} Profit And Loss (% All) Crossed`,
                  icon: () => IconTablerArrowsCross,
                  applyPreset(params) {
                    return applyMultipleSeries({
                      scale,
                      ...params,
                      priceScaleOptions: {
                        halved: true,
                      },
                      list: [
                        {
                          id: "supply-in-profit",
                          title: "Supply in profit",
                          color: colors.profit,
                          showPriceLine: true,
                          dataset:
                            params.datasets[scale][
                              `${datasetKey}SupplyInProfit%All`
                            ],
                        },
                        {
                          id: "supply-in-loss",
                          title: "Supply in loss",
                          color: colors.loss,
                          showPriceLine: true,
                          dataset:
                            params.datasets[scale][
                              `${datasetKey}SupplyInLoss%All`
                            ],
                        },
                      ],
                    });
                  },
                  description: "",
                },
                {
                  id: `${scale}-${id}-profit-and-loss-percentage-all-stacked`,
                  name: "Stacked",
                  title: `${title} Profit And Loss (% All) Stacked`,
                  icon: () => IconTablerStack,
                  applyPreset(params) {
                    return applyMultipleSeries({
                      scale,
                      ...params,
                      priceScaleOptions: {
                        halved: true,
                      },
                      list: [
                        {
                          id: "supply-in-profit",
                          title: "Supply in profit",
                          color: colors.profit,
                          seriesType: SeriesType.Stacked,
                          dataset:
                            params.datasets[scale][
                              `${datasetKey}SupplyInProfit%All`
                            ],
                        },
                        {
                          id: "supply-in-loss",
                          title: "Supply in loss",
                          color: colors.loss,
                          seriesType: SeriesType.Stacked,
                          dataset:
                            params.datasets[scale][
                              `${datasetKey}SupplyInLoss%All`
                            ],
                        },
                      ],
                    });
                  },
                  description: "",
                },
              ],
            },
            {
              id: `${scale}-${id}-supply-in-profit-and-loss-percentage-self`,
              name: "% Self",
              tree: [
                {
                  id: `${scale}-${id}-supply-in-profit-and-loss-percentage-self-crossed`,
                  name: "Crossed",
                  title: `${title} Supply In Profit And Loss (% Self) Crossed`,
                  icon: () => IconTablerArrowsCross,
                  applyPreset(params) {
                    return applyMultipleSeries({
                      scale,
                      ...params,
                      priceScaleOptions: {
                        halved: true,
                      },
                      list: [
                        {
                          title: "50%",
                          id: "50p",
                          color: colors.gray,
                          dataset: params.datasets[scale].value50,
                          options: {
                            lineStyle: LineStyle.SparseDotted,
                            lastValueVisible: false,
                          },
                        },
                        {
                          id: "100p",
                          title: "100%",
                          color: colors.white,
                          dataset: params.datasets[scale].value100,
                          options: {
                            lastValueVisible: false,
                          },
                        },
                        {
                          id: "supply-in-profit",
                          title: "Supply in profit",
                          dataset:
                            params.datasets[scale][
                              `${datasetKey}SupplyInProfit%Self`
                            ],
                          color: colors.profit,
                          showPriceLine: true,
                        },
                        {
                          id: "supply-in-loss",
                          title: "Supply in loss",
                          color: colors.loss,
                          dataset:
                            params.datasets[scale][
                              `${datasetKey}SupplyInLoss%Self`
                            ],
                          showPriceLine: true,
                        },
                      ],
                    });
                  },
                  description: "",
                },
                {
                  id: `${scale}-${id}-supply-in-profit-and-loss-percentage-self-stacked`,
                  name: "Stacked",
                  title: `${title} Supply In Profit And Loss (% Self) Stacked`,
                  icon: () => IconTablerStack,
                  applyPreset(params) {
                    return applyMultipleSeries({
                      scale,
                      ...params,
                      priceScaleOptions: {
                        halved: true,
                      },
                      list: [
                        {
                          id: "50p",
                          title: "50%",
                          color: colors.gray,
                          dataset: params.datasets[scale].value50,
                          options: {
                            lineStyle: LineStyle.SparseDotted,
                            lastValueVisible: false,
                          },
                        },
                        {
                          id: "supply-in-profit",
                          title: "Supply in profit",
                          color: colors.profit,
                          seriesType: SeriesType.Stacked,
                          dataset:
                            params.datasets[scale][
                              `${datasetKey}SupplyInProfit%Self`
                            ],
                        },
                        {
                          id: "supply-in-loss",
                          title: "Supply in loss",
                          color: colors.loss,
                          seriesType: SeriesType.Stacked,
                          dataset:
                            params.datasets[scale][
                              `${datasetKey}SupplyInLoss%Self`
                            ],
                        },
                      ],
                    });
                  },
                  description: "",
                },
                createMomentumPresetFolder({
                  datasets: datasets[scale],
                  scale,
                  id: `${scale}-${id}-supply-in-profit-and-loss-percentage-self`,
                  title: `${title} Supply In Profit And Loss (% Self)`,
                  datasetKey: `${datasetKey}SupplyPNL%Self`,
                }),
              ],
            },
          ],
        },
      ],
    },
    {
      id: `${scale}-${id}-price-paid`,
      name: "Prices Paid",
      tree: [
        {
          id: `${scale}-${id}-mean-price-paid`,
          name: `Mean`,
          title: `${title} Mean Price Paid`,
          icon: () => IconTablerMathAvg,
          applyPreset(params) {
            return applyMultipleSeries({
              scale,
              ...params,
              list: [
                {
                  id: "mean",
                  title: "Mean",
                  color,
                  dataset: params.datasets[scale][`${datasetKey}PricePaidMean`],
                },
              ],
            });
          },
          description: "",
        },
        {
          id: `${scale}-${id}-price-paid-deciles`,
          name: `Deciles`,
          title: `${title} deciles`,
          icon: () => IconTablerSquareHalf,
          applyPreset(params) {
            return applyMultipleSeries({
              scale,
              ...params,
              list: percentiles
                .filter(({ value }) => Number(value) % 10 === 0)
                .map(({ name, route, key }) => ({
                  id: route.replaceAll("_", "-"),
                  dataset: params.datasets[scale][`${datasetKey}${key}`],
                  color,
                  title: name,
                })),
            });
          },
          description: "",
        },
        ...percentiles.map(
          ({ name, route, key, title }): PartialPreset => ({
            id: `${scale}-${id}-${route.replaceAll("_", "-")}`,
            name,
            title: `${title} ${title}`,
            icon: () => IconTablerSquareHalf,
            applyPreset(params) {
              return applyMultipleSeries({
                scale,
                ...params,
                list: [
                  {
                    id: route.replaceAll("_", "-"),
                    title: name,
                    color,
                    dataset: params.datasets[scale][`${datasetKey}${key}`],
                  },
                ],
              });
            },
            description: "",
          }),
        ),
      ],
    },
  ];
}
