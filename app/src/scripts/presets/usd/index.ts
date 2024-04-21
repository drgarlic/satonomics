import { PriceScaleMode } from "lightweight-charts";

import { applyMultipleSeries } from "/src/scripts";

import description from "./description.md?raw";

export function createPresets(scale: ResourceScale) {
  return {
    id: `${scale}-currency-usd`,
    name: "USD - United States Dollar",
    tree: [
      {
        id: `${scale}-price-usd`,
        icon: IconTablerCurrencyDollar,
        name: "Price",
        title: "Bitcoin Price In US Dollars - USD",
        applyPreset(params) {
          return applyMultipleSeries({ ...params, scale });
        },
        description,
      },
      {
        id: `${scale}-performance-usd`,
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
        id: `${scale}-marketcap`,
        icon: IconTablerInfinity,
        name: "Marketcap",
        title: "Bitcoin USD Market Capitalization",
        applyPreset(params) {
          return applyMultipleSeries({
            scale,
            ...params,
            priceDataset: params.datasets[scale].marketCapitalization,
            priceOptions: {
              id: "marketcap",
              title: "Market Cap.",
            },
          });
        },
        description,
      },
    ],
  } satisfies PresetFolder;
}
