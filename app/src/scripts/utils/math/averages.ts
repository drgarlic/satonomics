import { computeSum } from "./sum";

export const computeAverage = (values: number[]) =>
  computeSum(values) / values.length;

export const computeMovingAverage = <
  T extends SingleValueData = SingleValueData,
>(
  dataset: T[] | null,
  interval: number,
) => {
  if (!dataset?.length) return null;

  return dataset.map((data, index) => ({
    ...data,
    value: computeAverage(
      dataset
        .slice(Math.max(index - interval + 1, 0), index + 1)
        .map((data) => data.value || 1),
    ),
  }));
};
