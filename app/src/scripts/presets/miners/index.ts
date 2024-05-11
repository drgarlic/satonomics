import { PriceScaleMode } from "lightweight-charts";

import { applyMultipleSeries, colors } from "/src/scripts";

export function createPresets(scale: ResourceScale) {
  return {
    id: `${scale}-miners`,
    name: "Miners",
    tree: [
      {
        id: `${scale}-yearly-inflation-rate`,
        icon: IconTablerBuildingFactory,
        name: "Yearly Inflation Rate",
        title: "Yearly Inflation Rate (%)",
        description: "",
        applyPreset(params) {
          return applyMultipleSeries({
            scale,
            ...params,
            priceScaleOptions: {
              halved: true,
              mode: PriceScaleMode.Logarithmic,
            },
            list: [
              {
                id: "yearly-inflation-rate",
                title: "Yearly Inflation Rate (%)",
                color: colors.bitcoin,
                dataset: params.datasets[scale].yearly_inflation_rate,
              },
            ],
          });
        },
      },
      {
        id: `${scale}-subsidies`,
        name: "Subsidies",
        tree: [
          {
            id: `${scale}-daily-subsidies`,
            name: "Daily",
            tree: [
              {
                id: `${scale}-daily-subsidies-in-bitcoin`,
                icon: IconTablerMoneybag,
                name: "In Bitcoin",
                title: "Daily Subsidies (In Bitcoin)",
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
                        id: "subsidy",
                        title: "Subsidy",
                        color: colors.bitcoin,
                        dataset: params.datasets[scale].subsidy,
                      },
                    ],
                  });
                },
              },
              {
                id: `${scale}-daily-subsidies-in-dollars`,
                icon: IconTablerCash,
                name: "In Dollars",
                title: "Daily Subsidies (In Dollars)",
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
                        id: "subsidy-in-dollars",
                        title: "Subsidy In Dollars",
                        color: colors.dollars,
                        dataset: params.datasets[scale].subsidy_in_dollars,
                      },
                    ],
                  });
                },
              },
            ],
          },
          ...(scale === "date"
            ? ([
                {
                  id: `${scale}-last-subsidy`,
                  name: "Last",
                  tree: [
                    {
                      id: `${scale}-last-subsidy-in-bitcoin`,
                      icon: IconTablerCoinBitcoin,
                      name: "In Bitcoin",
                      title: "Last Subsidy (In Bitcoin)",
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
                              id: "last",
                              title: "Last",
                              color: colors.bitcoin,
                              dataset: params.datasets[scale].last_subsidy,
                            },
                          ],
                        });
                      },
                    },
                    {
                      id: `${scale}-last-subsidy-in-dollars`,
                      icon: IconTablerCoin,
                      name: "In Dollars",
                      title: "Last Subsidy (In Dollars)",
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
                              id: "last",
                              title: "Last",
                              color: colors.dollars,
                              dataset:
                                params.datasets[scale].subsidy_in_dollars,
                            },
                          ],
                        });
                      },
                    },
                  ],
                },
              ] as PresetTree)
            : []),
        ],
      },
      {
        id: `${scale}-fees`,
        icon: IconTablerCut,
        name: "Fees",
        title: "Daily Fees",
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
                id: "fees",
                title: "Fees",
                color: colors.bitcoin,
                dataset: params.datasets[scale].fees,
              },
            ],
          });
        },
      },
    ],
  } satisfies PresetFolder;
}
