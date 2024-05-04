import { createResourceDataset } from "../base";
import { createCommonDatasets } from "../common";

export function createHeightDatasets({
  setActiveResources,
}: {
  setActiveResources: Setter<Set<ResourceDataset<any, any>>>;
}) {
  const price = createResourceDataset<"height", OHLC>({
    scale: "height",
    path: "/height-to-ohlc",
    setActiveResources,
  });

  const common = createCommonDatasets({ price, setActiveResources });

  return {
    price,
    ...common,
    timestamp: createResourceDataset({
      scale: "height",
      path: `/height-to-timestamp`,
      setActiveResources,
    }),
  };
}
