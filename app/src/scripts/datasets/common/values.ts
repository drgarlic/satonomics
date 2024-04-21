import { createTransformedLazyDataset } from "../base";

export function createValuesDatasets<Scale extends ResourceScale>(
  price: Dataset<Scale>,
) {
  return {
    value50: createTransformedLazyDataset(price, () => 50),
    value100: createTransformedLazyDataset(price, () => 100),
    value144: createTransformedLazyDataset(price, () => 144),
  };
}
