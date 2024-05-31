import { PriceScaleMode } from "lightweight-charts";

import { applyMultipleSeries } from "/src/scripts";

import description from "./description.md?raw";

export function createPresets(scale: ResourceScale) {
  return {
    id: `${scale}-market`,
    name: "Market",
    tree: [
      {
        id: `${scale}-to-market-price`,
        icon: IconTablerCurrencyDollar,
        name: "Price",
        title: "Bitcoin Price In US Dollars - USD",
        applyPreset(params) {
          return applyMultipleSeries({ ...params, scale });
        },
        description,
      },
      {
        id: `${scale}-to-market-performance`,
        icon: IconTablerPercentage,
        name: "Performance",
        title: "Bitcoin USD Performance",
        applyPreset(params) {
          return applyMultipleSeries({
            scale,
            ...params,
            priceOptions: {
              id: "performance",
              title: "Performance",
              priceScaleOptions: {
                mode: PriceScaleMode.Percentage,
              },
            },
          });
        },
        description,
      },
      {
        id: `${scale}-to-market-cap`,
        icon: IconTablerInfinity,
        name: "Capitalization",
        title: "Bitcoin USD Market Capitalization",
        applyPreset(params) {
          return applyMultipleSeries({
            scale,
            ...params,
            priceDataset: params.datasets[scale].market_cap,
            priceOptions: {
              id: "market-cap",
              title: "Market Cap.",
            },
          });
        },
        description,
      },
    ],
  } satisfies PresetFolder;
}
