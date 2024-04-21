import { createResourceDataset } from "../base";
import { createCommonDatasets } from "../common";

export function createHeightDatasets() {
  // const price = {
  //   scale: "height" as const,
  //   values: () => [] as DatasetCandlestickData[],
  //   sources: dateToFetchedPrice.sources,
  //   url: new URL(""),
  // };

  const price = createResourceDataset({
    scale: "height",
    path: "/height-to-close",
  });

  const common = createCommonDatasets(price);

  return {
    price,
    ...common,
    timestamp: createResourceDataset({
      scale: "height",
      path: `/height-to-timestamp`,
    }),
  };
}
