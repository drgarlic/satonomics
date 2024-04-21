import { createDateDatasets } from "./date";
import { createHeightDatasets } from "./height";

export * from "./common";
export * from "./date";
export * from "./height";

export const scales = ["date" as const, "height" as const];

export function createDatasets() {
  return {
    date: createDateDatasets(),
    height: createHeightDatasets(),
  } satisfies Record<ResourceScale, any>;
}

// export function createResourceDatasets() {
//   return {
//     date: {
//       price,
//       ...createMarketCapitalizationDatasets({
//         // commonDateDatasets.marketCapitalization as Dataset<"date">, // TODO: Fix types
//       }),
//       ...createCurrencyResources(),
//       ...createCommonResources("date"),
//       ...createAgeResources("date"),
//       ...createAddressResources("date"),
//     },
//     height: {
//       price: heightToPrice,
//       timestamp: createResourceDataset({
//         scale: "height",
//         path: `/height-to-timestamp`,
//       }),
//       ...createCommonResources("height"),
//       ...createAgeResources("height"),
//       ...createAddressResources("height"),
//     },
//   };
// }
