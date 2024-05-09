import groupedKeysToPath from "/src/../../datasets/grouped_keys_to_url_path.json";

import { createResourceDataset } from "../base";

// import { createCommonDatasets } from "../common";

export function createHeightDatasets({
  setActiveResources,
}: {
  setActiveResources: Setter<Set<ResourceDataset<any, any>>>;
}) {
  type Key = keyof typeof groupedKeysToPath.height;
  type ResourceData = ReturnType<typeof createResourceDataset<"height">>;

  const resourceDatasets = {} as Record<Exclude<Key, "ohlc">, ResourceData>;

  Object.keys(groupedKeysToPath.height).forEach(([_key, path]) => {
    const key = _key as Key;
    if (key !== "ohlc") {
      resourceDatasets[key] = createResourceDataset<"height">({
        scale: "height",
        path,
        setActiveResources,
      });
    }
  });

  const price = createResourceDataset<"height", OHLC>({
    scale: "height",
    path: "/height-to-ohlc",
    setActiveResources,
  });

  // const common = createCommonDatasets({ price, setActiveResources });

  return {
    ...resourceDatasets,
    price,
    // ...common,
    // timestamp: createResourceDataset({
    //   scale: "height",
    //   path: `/height-to-timestamp`,
    //   setActiveResources,
    // }),
  };
}
