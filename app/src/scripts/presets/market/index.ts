import { PriceScaleMode } from "lightweight-charts";

import { colors } from "../../utils/colors";
import { applyMultipleSeries } from "../templates/multiple";
import { createPresets as createAveragesPresets } from "./averages";
import { createPresets as createIndicatorsPresets } from "./indicators";
import { createPresets as createReturnsPresets } from "./returns";

export function createPresets({
  scale,
  datasets,
}: {
  scale: ResourceScale;
  datasets: Datasets;
}) {
  return {
    name: "Market",
    tree: [
      {
        scale,
        icon: IconTablerCurrencyDollar,
        name: "Price",
        title: "Market Price",
        applyPreset(params) {
          return applyMultipleSeries({ ...params });
        },
        description: "",
      },
      {
        scale,
        icon: IconTablerPercentage,
        name: "Performance",
        title: "Market Performance",
        applyPreset(params) {
          return applyMultipleSeries({
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
        description: "",
      },
      {
        scale,
        icon: IconTablerInfinity,
        name: "Capitalization",
        title: "Market Capitalization",
        applyPreset(params) {
          return applyMultipleSeries({
            ...params,
            priceScaleOptions: {
              halved: true,
            },
            list: [
              {
                title: "Market Cap.",
                dataset: params.datasets[scale].market_cap,
                color: colors.bitcoin,
              },
            ],
          });
        },
        description: "",
      },
      ...(scale === "date"
        ? ([
            createAveragesPresets(datasets),
            createReturnsPresets(datasets),
            createIndicatorsPresets(datasets),
          ] satisfies PartialPresetTree)
        : []),
    ],
  } satisfies PartialPresetFolder;
}
