import { createDateDatasets } from "./date";
import { createHeightDatasets } from "./height";

export * from "./common";
export * from "./date";
export * from "./height";

export const scales = ["date" as const, "height" as const];

export function createDatasets({
  setActiveResources,
}: {
  setActiveResources: Setter<Set<ResourceDataset<any, any>>>;
}) {
  return {
    date: createDateDatasets({ setActiveResources }),
    height: createHeightDatasets({ setActiveResources }),
  } satisfies Record<ResourceScale, any>;
}
