import { createLazyMemo } from "@solid-primitives/memo";

import {
  colors,
  computeMovingAverage,
  ONE_DAY_IN_MS,
  sortedInsert,
} from "/src/scripts";

export * from "./ratio";

const MEDIAN = 0.5;

const FIRST_USABLE_MEAN_RATIO_DATE_NUMBER =
  new Date("2012-01-01").valueOf() / ONE_DAY_IN_MS;

const FIRST_USABLE_MEAN_RATIO_HEIGHT_NUMBER = 160_000; // ~2012-01-01

export enum Momentum {
  red = 1,
  yellow = 2,
  green = 3,
}

function createLazyDataset<
  Scale extends ResourceScale,
  T extends SingleValueData = SingleValueData,
>(
  scale: Scale,
  calc: () => DatasetValue<T>[] | null,
  sourcesList: Accessor<Sources>[],
): Dataset<Scale, T> {
  return {
    scale,
    values: createLazyMemo(calc),
    sources: createLazyMemo(() => {
      const map = new Map<string, Source>();
      sourcesList.forEach((sources) => {
        sources().forEach((value, key) => {
          map.set(key, value);
        });
      });
      return map;
    }),
  };
}

export function createTransformedLazyDataset<Scale extends ResourceScale>(
  dataset: Dataset<Scale>,
  transform: (value: number, index: number, array: SingleValueData[]) => number,
) {
  return createLazyDataset(
    dataset.scale,
    () =>
      dataset.values()?.map(({ time, number, value }, index, array) => ({
        number,
        time,
        value: transform(value, index, array),
      })) || null,
    [dataset.sources],
  );
}

export function createNetChangeLazyDataset<Scale extends ResourceScale>(
  dataset: Dataset<Scale>,
  days = 1,
) {
  return createTransformedLazyDataset(
    dataset,
    (value, index, array) =>
      value - (index >= days ? array[index - days].value : 0),
  );
}

export function createAnnualizedLazyDataset<Scale extends ResourceScale>(
  dataset: Dataset<Scale>,
) {
  let last365values = [] as number[];
  let sum = 0;

  return createTransformedLazyDataset(dataset, (value) => {
    if (last365values.length > 365) {
      throw Error("unreachable!");
    } else if (last365values.length === 365) {
      sum -= last365values[0];
      last365values = last365values.slice(1);
    }

    last365values.push(value);
    sum += value;

    return sum;
  });
}

export function createMedianLazyDataset<Scale extends ResourceScale>(
  dataset: Dataset<Scale>,
  number: number,
) {
  if (!number) {
    throw Error("Median cannot be less than 1");
  }

  const isEven = number % 2 === 0;
  const halvedNumber = isEven ? number / 2 : Math.floor(number / 2);

  let lastXValues = [] as number[];

  return createTransformedLazyDataset(dataset, (value) => {
    if (lastXValues.length === number) {
      lastXValues = lastXValues.slice(1);
    }
    lastXValues.push(value);
    const sorted = [...lastXValues].sort();
    if (isEven) {
      return (sorted[halvedNumber - 1] + sorted[halvedNumber]) / 2;
    } else {
      return sorted[halvedNumber];
    }
  });
}

function createLazyOffset<Scale extends ResourceScale>(
  source: Dataset<Scale>,
  toOffset: Dataset<Scale>,
) {
  return createLazyMemo(() => {
    const offset = toOffset
      .values()
      ?.findIndex(({ number }) => number === source.values()?.at(0)?.number);

    return !offset || offset === -1 ? 0 : offset;
  });
}

export function createAddedLazyDataset<Scale extends ResourceScale>(
  datasetRef: Dataset<Scale>,
  datasetToAdd: Dataset<Scale>,
) {
  const offset = createLazyOffset(datasetRef, datasetToAdd);

  return createLazyDataset(
    datasetRef.scale,
    () => {
      let secondValue = 0;
      let index = offset();

      const adders = datasetToAdd.values();

      if (!adders) return null;

      return (
        datasetRef.values()?.map(({ number, time, value }) => {
          const data = adders.at(index);
          if (number === data?.number) {
            secondValue = data.value;
            index += 1;
          }

          return {
            number,
            time,
            value: value + secondValue,
          };
        }) || null
      );
    },
    [datasetRef.sources, datasetToAdd.sources],
  );
}

export function createSubtractedLazyDataset<Scale extends ResourceScale>(
  datasetRef: Dataset<Scale>,
  datasetToSubtract: Dataset<Scale>,
) {
  const offset = createLazyOffset(datasetRef, datasetToSubtract);

  return createLazyDataset(
    datasetRef.scale,
    () => {
      let toSubtract = 0;

      let index = offset();

      const subtracters = datasetToSubtract.values();

      if (!subtracters) return null;

      return (
        datasetRef.values()?.map(({ time, value, number }) => {
          const data = subtracters.at(index);

          if (number === data?.number) {
            toSubtract = data.value;
            index += 1;
          }

          return {
            number,
            time,
            value: value - toSubtract,
          };
        }) || null
      );
    },
    [datasetRef.sources, datasetToSubtract.sources],
  );
}

export function createMultipliedLazyDataset<Scale extends ResourceScale>(
  datasetRef: Dataset<Scale>,
  multiplierDataset: Dataset<Scale>,
  defaultMultiplier = 1,
) {
  const offsetRef = createLazyOffset(multiplierDataset, datasetRef);

  const offsetMultiplier = createLazyOffset(datasetRef, multiplierDataset);

  return createLazyDataset(
    datasetRef.scale,
    () => {
      const multipliers = multiplierDataset.values();

      if (!multipliers) return null;

      return (
        datasetRef
          .values()
          ?.slice(offsetRef())
          .map(({ number, time, value }, index) => ({
            number,
            time,
            value:
              value *
              (multipliers.at(index + offsetMultiplier())?.value ||
                defaultMultiplier),
          })) || null
      );
    },
    [datasetRef.sources, multiplierDataset.sources],
  );
}

export const createDividedLazyDataset = <Scale extends ResourceScale>(
  datasetRef: Dataset<Scale>,
  dividerDataset: Dataset<Scale>,
  isPercentage?: boolean,
) => {
  const offsetRef = createLazyOffset(dividerDataset, datasetRef);

  const offsetDivider = createLazyOffset(datasetRef, dividerDataset);

  return createLazyDataset(
    datasetRef.scale,
    () => {
      const dividers = dividerDataset.values();

      if (!dividers) return null;

      return (
        datasetRef
          .values()
          ?.slice(offsetRef())
          .map(({ number, time, value }, index) => ({
            number,
            time,
            value:
              (value / (dividers.at(index + offsetDivider())?.value || 1)) *
              (isPercentage ? 100 : 1),
          })) || null
      );
    },
    [datasetRef.sources, dividerDataset.sources],
  );
};

export const createCumulatedLazyDataset = <Scale extends ResourceScale>(
  dataset: Dataset<Scale>,
) =>
  createLazyDataset(
    dataset.scale,
    () => {
      let sum = 0;

      return (
        dataset.values()?.map(({ number, time, value }) => {
          sum += value;

          return {
            number,
            time,
            value: sum,
          };
        }) || null
      );
    },
    [dataset.sources],
  );

export function createPercentageMomentumLazyDataset<
  Scale extends ResourceScale,
>(dataset: Dataset<Scale>) {
  return createLazyDataset(
    dataset.scale,
    () => {
      let momentum = Momentum.green;

      return (
        dataset.values()?.map(({ number, time, value }) => {
          let _value: Momentum;

          if (momentum === Momentum.green) {
            if (value <= 45) {
              momentum = Momentum.red;
              _value = momentum;
            } else if (value < 50) {
              _value = Momentum.yellow;
            } else {
              _value = momentum;
            }
          } else {
            if (value >= 55) {
              momentum = Momentum.green;
              _value = momentum;
            } else if (value > 50) {
              _value = Momentum.yellow;
            } else {
              _value = momentum;
            }
          }

          return {
            number,
            time,
            value: _value,
            color:
              _value === Momentum.green
                ? colors.momentumGreen
                : _value === Momentum.yellow
                  ? colors.momentumYellow
                  : colors.momentumRed,
          };
        }) || null
      );
    },
    [dataset.sources],
  );
}

export function createBLSHBitcoinReturnsLazyDataset<
  Scale extends ResourceScale,
>({
  momentumDataset,
  price,
}: {
  momentumDataset: Dataset<Scale>;
  price: Dataset<Scale>;
}) {
  return createLazyDataset(
    momentumDataset.scale,
    () => {
      let fiatAmount = 0;
      let btcAmount = 0;
      let dcaAmount = 100;
      let momentum = Momentum.green;

      const offset = createLazyOffset(price, momentumDataset);

      const momentumValues = momentumDataset.values();

      if (!momentumValues) return null;

      return (
        price.values()?.map(({ number, time, value: currentPrice }, index) => {
          const momentumI =
            momentumValues.at(index + offset())?.value || Momentum.green;

          if (momentum !== momentumI) {
            if (momentumI === Momentum.green) {
              momentum = momentumI;
              btcAmount = (fiatAmount + dcaAmount) / currentPrice;
              fiatAmount = 0;
            } else if (momentumI === Momentum.red) {
              momentum = momentumI;
              fiatAmount = btcAmount * currentPrice + dcaAmount;
              btcAmount = 0;
            }
          } else {
            if (momentum === Momentum.green) {
              btcAmount += dcaAmount / currentPrice;
            } else if (momentum === Momentum.red) {
              fiatAmount += dcaAmount;
            } else {
              throw Error("Unreachable");
            }
          }

          return {
            number,
            time,
            value: btcAmount + fiatAmount / currentPrice,
            fiat: fiatAmount + btcAmount * currentPrice,
          };
        }) || null
      );
    },
    [momentumDataset.sources, price.sources],
  );
}

export function createBLSHDollarReturnsLazyDataset<
  Scale extends ResourceScale,
>({
  bitcoinReturns,
}: {
  bitcoinReturns: ReturnType<typeof createBLSHBitcoinReturnsLazyDataset<Scale>>;
}) {
  return createLazyDataset(
    bitcoinReturns.scale,
    () =>
      bitcoinReturns.values()?.map(({ number, time, fiat: value }) => ({
        number,
        time,
        value,
      })) || null,
    [bitcoinReturns.sources],
  );
}

export function createLazyAverageDataset<Scale extends ResourceScale>(
  dataset: Dataset<Scale>,
  number: number,
) {
  return createLazyDataset(
    dataset.scale,
    () => computeMovingAverage(dataset.values(), number),
    [dataset.sources],
  );
}

export function createLazyPercentileDataset<Scale extends ResourceScale>(
  ratio: Dataset<Scale>,
  quantile: number,
) {
  const { scale } = ratio;
  return createLazyDataset(
    scale,
    () => {
      const ratioValues = ratio.values();

      if (!ratioValues?.length) return [];

      let sortedRatios: number[] = [];

      const index = ratioValues.findIndex(
        ({ number }) =>
          number ===
          (scale === "date"
            ? FIRST_USABLE_MEAN_RATIO_DATE_NUMBER
            : FIRST_USABLE_MEAN_RATIO_HEIGHT_NUMBER),
      );

      if (index === -1) return null;

      return ratioValues
        .slice(index)
        .map(({ number, time, value: ratio }, dataIndex) => {
          sortedInsert(sortedRatios, ratio);

          const length = dataIndex + 1;

          const quantileValue = quantile / 100;

          let value: number;

          if (quantileValue !== MEDIAN || length % 2 !== 0) {
            const sortedIndex = Math.floor(length * quantileValue);

            value = sortedRatios[sortedIndex];
          } else {
            const mid = Math.floor(length / 2);

            value = (sortedRatios[mid - 1] + sortedRatios[mid]) / 2;
          }

          return {
            number,
            time,
            value,
          };
        });
    },
    [ratio.sources],
  );
}

export function createLazyMomentumDataset<Scale extends ResourceScale>(
  raw: Dataset<Scale>,
  smoothed: Dataset<Scale>,
  extraSmoothed: Dataset<Scale>,
) {
  return createLazyDataset(
    raw.scale,
    () =>
      extraSmoothed.values()?.map(({ number, time, value }, index) => {
        const rawValue = raw.values()?.[index].value || 0;
        const smoothedValue = smoothed.values()?.[index].value || 0;

        const momentum =
          smoothedValue >= value && rawValue >= value
            ? Momentum.green
            : smoothedValue < value && rawValue < value
              ? Momentum.red
              : Momentum.yellow;

        return {
          number,
          time,
          value: momentum,
          color:
            momentum === Momentum.green
              ? colors.momentumGreen
              : momentum === Momentum.red
                ? colors.momentumRed
                : colors.momentumYellow,
        };
      }) || null,
    [raw.sources],
  );
}
