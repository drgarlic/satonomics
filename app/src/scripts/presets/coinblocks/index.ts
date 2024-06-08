import { PriceScaleMode } from "lightweight-charts";

import { colors } from "../../utils/colors";
import { applyMultipleSeries, SeriesType } from "../templates/multiple";

export function createPresets<Scale extends ResourceScale>({
  scale,
  datasets: _datasets,
}: {
  scale: Scale;
  datasets: Datasets;
}) {
  const datasets = _datasets[scale];

  return {
    name: "Cointime Economics",
    tree: [
      {
        name: "Prices",
        tree: [
          {
            scale,
            icon: IconTablerArrowsCross,
            name: "All",
            title: "All Cointime Prices",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                list: [
                  {
                    title: "Vaulted Price",
                    color: colors.vaultedness,
                    dataset: datasets.vaulted_price,
                  },
                  {
                    title: "Active Price",
                    color: colors.liveliness,
                    dataset: datasets.active_price,
                  },
                  {
                    title: "True Market Mean",
                    color: colors.trueMarketMeanPrice,
                    dataset: datasets.true_market_mean,
                  },
                  {
                    title: "Realized Price",
                    color: colors.bitcoin,
                    dataset: datasets.realized_price,
                  },
                  {
                    title: "Cointime",
                    color: colors.cointimePrice,
                    dataset: datasets.cointime_price,
                  },
                ],
              });
            },
          },
          {
            name: "Active",
            tree: [
              {
                scale,
                icon: IconTablerHeartBolt,
                name: "Price",
                title: "Active Price",
                description: "",
                applyPreset(params) {
                  return applyMultipleSeries({
                    ...params,
                    list: [
                      {
                        title: "Active Price",
                        color: colors.liveliness,
                        dataset: datasets.active_price,
                      },
                    ],
                  });
                },
              },
            ],
          },
          {
            name: "Vaulted",
            tree: [
              {
                scale,
                icon: IconTablerBuildingBank,
                name: "Price",
                title: "Vaulted Price",
                description: "",
                applyPreset(params) {
                  return applyMultipleSeries({
                    ...params,
                    list: [
                      {
                        title: "Vaulted Price",
                        color: colors.vaultedness,
                        dataset: datasets.vaulted_price,
                      },
                    ],
                  });
                },
              },
            ],
          },
          {
            name: "True Market Mean",
            tree: [
              {
                scale,
                icon: IconTablerStackMiddle,
                name: "Price",
                title: "True Market Mean",
                description: "",
                applyPreset(params) {
                  return applyMultipleSeries({
                    ...params,
                    list: [
                      {
                        title: "True Market Mean",
                        color: colors.trueMarketMeanPrice,
                        dataset: datasets.true_market_mean,
                      },
                    ],
                  });
                },
              },
            ],
          },
          {
            name: "Cointime Price",
            tree: [
              {
                scale,
                icon: IconTablerStackMiddle,
                name: "Price",
                title: "Cointime Price",
                description: "",
                applyPreset(params) {
                  return applyMultipleSeries({
                    ...params,
                    list: [
                      {
                        title: "Cointime",
                        color: colors.cointimePrice,
                        dataset: datasets.cointime_price,
                      },
                    ],
                  });
                },
              },
            ],
          },
        ],
      },
      {
        name: "Capitalizations",
        tree: [
          {
            scale,
            icon: IconTablerArrowsCross,
            name: "All",
            title: "Cointime Capitalizations",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                priceScaleOptions: {
                  halved: true,
                  mode: PriceScaleMode.Logarithmic,
                },
                list: [
                  {
                    title: "Market Cap",

                    color: colors.white,
                    dataset: datasets.market_cap,
                  },
                  {
                    title: "Realized Cap",
                    color: colors.realizedCap,
                    dataset: datasets.realized_cap,
                  },
                  {
                    title: "Investor Cap",
                    color: colors.investorCap,
                    dataset: datasets.investor_cap,
                  },
                  {
                    title: "Thermo Cap",
                    color: colors.thermoCap,
                    dataset: datasets.thermo_cap,
                  },
                ],
              });
            },
          },
          {
            scale,
            icon: IconTablerPick,
            name: "Thermo Cap",
            title: "Thermo Cap",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                priceScaleOptions: {
                  halved: true,
                  mode: PriceScaleMode.Logarithmic,
                },
                list: [
                  {
                    title: "Thermo Cap",
                    color: colors.thermoCap,
                    dataset: datasets.thermo_cap,
                  },
                ],
              });
            },
          },
          {
            scale,
            icon: IconTablerTie,
            name: "Investor Cap",
            title: "Investor Cap",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                priceScaleOptions: {
                  halved: true,
                  mode: PriceScaleMode.Logarithmic,
                },
                list: [
                  {
                    title: "Investor Cap",
                    color: colors.investorCap,
                    dataset: datasets.investor_cap,
                  },
                ],
              });
            },
          },
          {
            scale,
            icon: IconTablerDivide,
            name: "Thermo Cap To Investor Cap Ratio",
            title: "Thermo Cap To Investor Cap Ratio (%)",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                priceScaleOptions: {
                  halved: true,
                },
                list: [
                  {
                    title: "Ratio",
                    color: colors.bitcoin,
                    dataset: datasets.thermo_cap_to_investor_cap_ratio,
                  },
                ],
              });
            },
          },
        ],
      },
      {
        name: "Coinblocks",
        tree: [
          {
            scale,
            icon: IconTablerArrowsCross,
            name: "All",
            title: "All Coinblocks",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                priceScaleOptions: {
                  halved: true,
                },
                list: [
                  {
                    title: "Coinblocks Created",
                    color: colors.coinblocksCreated,
                    dataset: datasets.coinblocks_created,
                  },
                  {
                    title: "Coinblocks Destroyed",
                    color: colors.coinblocksDestroyed,
                    dataset: datasets.coinblocks_destroyed,
                  },
                  {
                    title: "Coinblocks Stored",
                    color: colors.coinblocksStored,
                    dataset: datasets.coinblocks_stored,
                  },
                ],
              });
            },
          },
          {
            scale,
            icon: IconTablerCube,
            name: "Created",
            title: "Coinblocks Created",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                priceScaleOptions: {
                  halved: true,
                },
                list: [
                  {
                    title: "Coinblocks Created",
                    color: colors.coinblocksCreated,
                    dataset: datasets.coinblocks_created,
                  },
                ],
              });
            },
          },
          {
            scale,
            icon: IconTablerFileShredder,
            name: "Destroyed",
            title: "Coinblocks Destroyed",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                priceScaleOptions: {
                  halved: true,
                },
                list: [
                  {
                    title: "Coinblocks Destroyed",
                    color: colors.coinblocksDestroyed,
                    dataset: datasets.coinblocks_destroyed,
                  },
                ],
              });
            },
          },
          {
            scale,
            icon: IconTablerBuildingWarehouse,
            name: "Stored",
            title: "Coinblocks Stored",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                priceScaleOptions: {
                  halved: true,
                },
                list: [
                  {
                    title: "Coinblocks Stored",
                    color: colors.coinblocksStored,
                    dataset: datasets.coinblocks_stored,
                  },
                ],
              });
            },
          },
        ],
      },
      {
        name: "Cumulative Coinblocks",
        tree: [
          {
            scale,
            icon: IconTablerArrowsCross,
            name: "All",
            title: "All Cumulative Coinblocks",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                priceScaleOptions: {
                  halved: true,
                },
                list: [
                  {
                    title: "Cumulative Coinblocks Created",
                    color: colors.coinblocksCreated,
                    dataset: datasets.cumulative_coinblocks_created,
                  },
                  {
                    title: "Cumulative Coinblocks Destroyed",
                    color: colors.coinblocksDestroyed,
                    dataset: datasets.cumulative_coinblocks_destroyed,
                  },
                  {
                    title: "Cumulative Coinblocks Stored",
                    color: colors.coinblocksStored,
                    dataset: datasets.cumulative_coinblocks_stored,
                  },
                ],
              });
            },
          },
          {
            scale,
            icon: IconTablerCube,
            name: "Created",
            title: "Cumulative Coinblocks Created",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                priceScaleOptions: {
                  halved: true,
                },
                list: [
                  {
                    title: "Cumulative Coinblocks Created",
                    color: colors.coinblocksCreated,
                    dataset: datasets.cumulative_coinblocks_created,
                  },
                ],
              });
            },
          },
          {
            scale,
            icon: IconTablerFileShredder,
            name: "Destroyed",
            title: "Cumulative Coinblocks Destroyed",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                priceScaleOptions: {
                  halved: true,
                },
                list: [
                  {
                    title: "Cumulative Coinblocks Destroyed",
                    color: colors.coinblocksDestroyed,
                    dataset: datasets.cumulative_coinblocks_destroyed,
                  },
                ],
              });
            },
          },
          {
            scale,
            icon: IconTablerBuildingWarehouse,
            name: "Stored",
            title: "Cumulative Coinblocks Stored",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                priceScaleOptions: {
                  halved: true,
                },
                list: [
                  {
                    title: "Cumulative Coinblocks Stored",
                    color: colors.coinblocksStored,
                    dataset: datasets.cumulative_coinblocks_stored,
                  },
                ],
              });
            },
          },
        ],
      },
      {
        name: "Liveliness & Vaultedness",
        tree: [
          {
            scale,
            icon: IconTablerHeartBolt,
            name: "Liveliness - Activity",
            title: "Liveliness (Activity)",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                priceScaleOptions: {
                  halved: true,
                },
                list: [
                  {
                    title: "Liveliness",
                    color: colors.liveliness,
                    dataset: datasets.liveliness,
                  },
                ],
              });
            },
          },
          {
            scale,
            icon: IconTablerBuildingBank,
            name: "Vaultedness",
            title: "Vaultedness",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                priceScaleOptions: {
                  halved: true,
                },
                list: [
                  {
                    title: "Vaultedness",
                    color: colors.vaultedness,
                    dataset: datasets.vaultedness,
                  },
                ],
              });
            },
          },
          {
            scale,
            icon: IconTablerArrowsCross,
            name: "Versus",
            title: "Liveliness V. Vaultedness",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                priceScaleOptions: {
                  halved: true,
                },
                list: [
                  {
                    title: "Liveliness",
                    color: colors.liveliness,
                    dataset: datasets.liveliness,
                  },
                  {
                    title: "Vaultedness",
                    color: colors.vaultedness,
                    dataset: datasets.vaultedness,
                  },
                ],
              });
            },
          },
          {
            scale,
            icon: IconTablerDivide,
            name: "Activity To Vaultedness Ratio",
            title: "Activity To Vaultedness Ratio",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                priceScaleOptions: {
                  halved: true,
                },
                list: [
                  {
                    title: "Activity To Vaultedness Ratio",
                    color: colors.activityToVaultednessRatio,
                    dataset: datasets.activity_to_vaultedness_ratio,
                  },
                ],
              });
            },
          },
          {
            scale,
            icon: IconTablerHeartBolt,
            name: "Concurrent Liveliness - Supply Adjusted Coindays Destroyed",
            title: "Concurrent Liveliness - Supply Adjusted Coindays Destroyed",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                priceScaleOptions: {
                  halved: true,
                },
                list: [
                  {
                    title: "Concurrent Liveliness 14d Median",
                    color: `${colors.liveliness}66`,
                    dataset: datasets.concurrent_liveliness_2w_median,
                  },
                  {
                    title: "Concurrent Liveliness",
                    color: colors.liveliness,
                    dataset: datasets.concurrent_liveliness,
                  },
                ],
              });
            },
          },
          {
            scale,
            icon: IconTablerStairs,
            name: "Liveliness Incremental Change",
            title: "Liveliness Incremental Change",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                priceScaleOptions: {
                  halved: true,
                },
                list: [
                  {
                    title: "Liveliness Incremental Change",
                    color: colors.darkLiveliness,
                    seriesType: SeriesType.Based,
                    dataset: datasets.liveliness_net_change,
                  },
                  {
                    title: "Liveliness Incremental Change 14 Day Median",
                    color: colors.liveliness,
                    seriesType: SeriesType.Based,
                    dataset: datasets.liveliness_net_change_2w_median,
                  },
                ],
              });
            },
          },
        ],
      },
      {
        name: "Supply",
        tree: [
          {
            scale,
            icon: IconTablerBuildingBank,
            name: "Vaulted",
            title: "Vaulted Supply",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                priceScaleOptions: {
                  halved: true,
                },
                list: [
                  {
                    title: "Vaulted Supply",
                    color: colors.vaultedness,
                    dataset: datasets.vaulted_supply,
                  },
                ],
              });
            },
          },
          {
            scale,
            icon: IconTablerHeartBolt,
            name: "Active",
            title: "Active Supply",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                priceScaleOptions: {
                  halved: true,
                },
                list: [
                  {
                    title: "Active Supply",
                    color: colors.liveliness,
                    dataset: datasets.active_supply,
                  },
                ],
              });
            },
          },
          {
            scale,
            icon: IconTablerArrowsCross,
            name: "Vaulted V. Active",
            title: "Vaulted V. Active",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                priceScaleOptions: {
                  halved: true,
                },
                list: [
                  {
                    title: "Circulating Supply",
                    color: colors.coinblocksCreated,
                    dataset: datasets.supply,
                  },
                  {
                    title: "Vaulted Supply",
                    color: colors.vaultedness,
                    dataset: datasets.vaulted_supply,
                  },
                  {
                    title: "Active Supply",
                    color: colors.liveliness,
                    dataset: datasets.active_supply,
                  },
                ],
              });
            },
          },
          // TODO: Fix, Bad data
          // {
          //   id: 'asymptomatic-supply-regions',
          //   icon: IconTablerDirections,
          //   name: 'Asymptomatic Supply Regions',
          //   title: 'Asymptomatic Supply Regions',
          //   description: '',
          //   applyPreset(params) {
          //     return applyMultipleSeries({
          //       ...params,
          //       priceScaleOptions: {
          //         halved: true,
          //       },
          //       list: [
          //         {
          //           id: 'min-vaulted',
          //           title: 'Min Vaulted Supply',
          //           color: colors.vaultedness,
          //           dataset: params.datasets.dateToMinVaultedSupply,
          //         },
          //         {
          //           id: 'max-active',
          //           title: 'Max Active Supply',
          //           color: colors.liveliness,
          //           dataset: params.datasets.dateToMaxActiveSupply,
          //         },
          //       ],
          //     })
          //   },
          // },
          {
            scale,
            icon: IconTablerBuildingBank,
            name: "Vaulted Net Change",
            title: "Vaulted Supply Net Change",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                priceScaleOptions: {
                  halved: true,
                },
                list: [
                  {
                    title: "Vaulted Supply Net Change",
                    color: colors.vaultedness,
                    dataset: datasets.vaulted_supply,
                  },
                ],
              });
            },
          },
          {
            scale,
            icon: IconTablerHeartBolt,
            name: "Active Net Change",
            title: "Active Supply Net Change",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                priceScaleOptions: {
                  halved: true,
                },
                list: [
                  {
                    title: "Active Supply Net Change",
                    color: colors.liveliness,
                    dataset: datasets.active_supply_net_change,
                  },
                ],
              });
            },
          },
          {
            scale,
            icon: IconTablerSwords,
            name: "Active VS. Vaulted 90D Net Change",
            title: "Active VS. Vaulted 90 Day Supply Net Change",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                priceScaleOptions: {
                  halved: true,
                },
                list: [
                  {
                    title: "Active Supply Net Change",
                    color: `${colors.liveliness}80`,
                    dataset: datasets.active_supply_3m_net_change,
                    seriesType: SeriesType.Based,
                  },
                  {
                    title: "Vaulted Supply Net Change",
                    color: `${colors.vaultedPrice}80`,
                    seriesType: SeriesType.Based,
                    dataset: datasets.vaulted_supply_3m_net_change,
                  },
                ],
              });
            },
          },
          // TODO: Fix, Bad data
          // {
          //   id: 'vaulted-supply-annualized-net-change',
          //   icon: IconTablerBuildingBank,
          //   name: 'Vaulted Annualized Net Change',
          //   title: 'Vaulted Supply Annualized Net Change',
          //   description: '',
          //   applyPreset(params) {
          //     return applyMultipleSeries({
          //       ...params,
          //       priceScaleOptions: {
          //         halved: true,
          //       },
          //       list: [
          //         {
          //           id: 'vaulted-annualized-supply-net-change',
          //           title: 'Vaulted Supply Annualized Net Change',
          //           color: colors.vaultedness,
          //           dataset:
          //             datasets.vaultedAnnualizedSupplyNetChange,
          //         },
          //       ],
          //     })
          //   },
          // },

          // TODO: Fix, Bad data
          // {
          //   id: 'vaulting-rate',
          //   icon: IconTablerBuildingBank,
          //   name: 'Vaulting Rate',
          //   title: 'Vaulting Rate',
          //   description: '',
          //   applyPreset(params) {
          //     return applyMultipleSeries({
          //       ...params,
          //       priceScaleOptions: {
          //         halved: true,
          //       },
          //       list: [
          //         {
          //           id: 'vaulting-rate',
          //           title: 'Vaulting Rate',
          //           color: colors.vaultedness,
          //           dataset: datasets.vaultingRate,
          //         },
          //         {
          //           id: 'nominal-inflation-rate',
          //           title: 'Nominal Inflation Rate',
          //           color: colors.orange,
          //           dataset: params.datasets.dateToYearlyInflationRate,
          //         },
          //       ],
          //     })
          //   },
          // },

          // TODO: Fix, Bad data
          // {
          //   id: 'active-supply-net-change-decomposition',
          //   icon: IconTablerArrowsCross,
          //   name: 'Active Supply Net Change Decomposition (90D)',
          //   title: 'Active Supply Net 90 Day Change Decomposition',
          //   description: '',
          //   applyPreset(params) {
          //     return applyMultipleSeries({
          //       ...params,
          //       priceScaleOptions: {
          //         halved: true,
          //       },
          //       list: [
          //         {
          //           id: 'issuance-change',
          //           title: 'Change From Issuance',
          //           color: colors.emerald,
          //           dataset:
          //             params.datasets
          //               [scale].activeSupplyChangeFromIssuance90dChange,
          //         },
          //         {
          //           id: 'transactions-change',
          //           title: 'Change From Transactions',
          //           color: colors.rose,
          //           dataset:
          //             params.datasets
          //               [scale].activeSupplyChangeFromTransactions90dChange,
          //         },
          //         // {
          //         //   id: 'active',
          //         //   title: 'Active Supply',
          //         //   color: colors.liveliness,
          //         //   dataset: datasets.activeSupply,
          //         // },
          //       ],
          //     })
          //   },
          // },

          {
            scale,
            icon: IconTablerTrendingUp,
            name: "In Profit",
            title: "Cointime Supply In Profit",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                priceScaleOptions: {
                  halved: true,
                },
                list: [
                  {
                    title: "Circulating Supply",
                    color: colors.coinblocksCreated,
                    dataset: datasets.supply,
                  },
                  {
                    title: "Vaulted Supply",
                    color: colors.vaultedness,
                    dataset: datasets.vaulted_supply,
                  },
                  {
                    title: "Supply in profit",
                    color: colors.bitcoin,
                    dataset: datasets.supply_in_profit,
                  },
                ],
              });
            },
          },
          {
            scale,
            icon: IconTablerTrendingDown,
            name: "In Loss",
            title: "Cointime Supply In Loss",
            description: "",
            applyPreset(params) {
              return applyMultipleSeries({
                ...params,
                priceScaleOptions: {
                  halved: true,
                },
                list: [
                  {
                    title: "Circulating Supply",
                    color: colors.coinblocksCreated,
                    dataset: datasets.supply,
                  },
                  {
                    title: "Active Supply",
                    color: colors.liveliness,
                    dataset: datasets.active_supply,
                  },
                  {
                    title: "Supply in Loss",
                    color: colors.bitcoin,
                    dataset: datasets.supply_in_loss,
                  },
                ],
              });
            },
          },
        ],
      },
      {
        scale,
        icon: IconTablerBuildingFactory,
        name: "Cointime Yearly Inflation Rate",
        title: "Cointime-Adjusted Yearly Inflation Rate (%)",
        description: "",
        applyPreset(params) {
          return applyMultipleSeries({
            ...params,
            priceScaleOptions: {
              halved: true,
              mode: PriceScaleMode.Logarithmic,
            },
            list: [
              {
                title: "Cointime Adjusted",
                color: colors.coinblocksCreated,
                dataset: datasets.cointime_adjusted_yearly_inflation_rate,
              },
              {
                title: "Nominal",
                color: colors.bitcoin,
                dataset: datasets.yearly_inflation_rate,
              },
            ],
          });
        },
      },
      {
        scale,
        icon: IconTablerWind,
        name: "Cointime Velocity",
        title: "Cointime-Adjusted Transactions Velocity",
        description: "",
        applyPreset(params) {
          return applyMultipleSeries({
            ...params,
            priceScaleOptions: {
              halved: true,
              mode: PriceScaleMode.Logarithmic,
            },
            list: [
              {
                title: "Cointime Adjusted",
                color: colors.coinblocksCreated,
                dataset: datasets.cointime_adjusted_velocity,
              },
              {
                title: "Nominal",
                color: colors.bitcoin,
                dataset: datasets.transaction_velocity,
              },
            ],
          });
        },
      },
    ],
  } satisfies PartialPresetFolder;
}
