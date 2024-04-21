import {
  createBLSHBitcoinReturnsLazyDataset,
  createBLSHDollarReturnsLazyDataset,
  createDividedLazyDataset,
  createLazyAverageDataset,
  createLazyMomentumDataset,
  createLazyPercentileDataset,
  createMultipliedLazyDataset,
} from ".";

export function appendRatioLazyDatasets<
  Scale extends ResourceScale,
  Key extends string,
>({
  datasets = {},
  sourceDataset,
  price,
  key,
}: {
  datasets: Partial<Record<`${Key}${RatioKey}`, Dataset<Scale>>>;
  key: Key;
  sourceDataset: Dataset<Scale>;
  price: Dataset<Scale>;
}) {
  const ratio = createDividedLazyDataset(price, sourceDataset);

  const ratio7DMA = createLazyAverageDataset(ratio, 7);

  const ratio1YMA = createLazyAverageDataset(ratio, 365);

  const ratioMomentum = createLazyMomentumDataset(ratio, ratio7DMA, ratio1YMA);

  const ratioMomentumBLSHBitcoinReturns = createBLSHBitcoinReturnsLazyDataset({
    momentumDataset: ratioMomentum,
    price,
  });

  const ratio99p9Percentile = createLazyPercentileDataset(ratio, 99.9);

  const ratio99p5Percentile = createLazyPercentileDataset(ratio, 99.5);

  const ratio99Percentile = createLazyPercentileDataset(ratio, 99);

  const ratio1Percentile = createLazyPercentileDataset(ratio, 1);

  const ratio0p5Percentile = createLazyPercentileDataset(ratio, 0.5);

  const ratio0p1Percentile = createLazyPercentileDataset(ratio, 0.1);

  // Create an object first to be sure that we didn't forget anything
  const ratioDatasets: Record<RatioKey, Dataset<Scale>> = {
    Ratio: ratio,
    Ratio7DayMovingAverage: ratio7DMA,
    Ratio1YearMovingAverage: ratio1YMA,
    RatioMomentum: ratioMomentum,
    RatioMomentumBLSHBitcoinReturns: ratioMomentumBLSHBitcoinReturns,
    RatioMomentumBLSHDollarReturns: createBLSHDollarReturnsLazyDataset({
      bitcoinReturns: ratioMomentumBLSHBitcoinReturns,
    }),
    "Ratio99.9Percentile": ratio99p9Percentile,
    "Ratio99.5Percentile": ratio99p5Percentile,
    Ratio99Percentile: ratio99Percentile,
    Ratio1Percentile: ratio1Percentile,
    "Ratio0.5Percentile": ratio0p5Percentile,
    "Ratio0.1Percentile": ratio0p1Percentile,
    "Ratio99.9Price": createMultipliedLazyDataset(
      ratio99p9Percentile,
      sourceDataset,
    ),
    "Ratio99.5Price": createMultipliedLazyDataset(
      ratio99p5Percentile,
      sourceDataset,
    ),
    Ratio99Price: createMultipliedLazyDataset(ratio99Percentile, sourceDataset),
    Ratio1Price: createMultipliedLazyDataset(ratio1Percentile, sourceDataset),
    "Ratio0.5Price": createMultipliedLazyDataset(
      ratio0p5Percentile,
      sourceDataset,
    ),
    "Ratio0.1Price": createMultipliedLazyDataset(
      ratio0p1Percentile,
      sourceDataset,
    ),
  };

  for (const [ratioKey, value] of Object.entries(ratioDatasets)) {
    datasets[`${key}${ratioKey as RatioKey}`] = value;
  }

  return datasets as Record<`${Key}${RatioKey}`, Dataset<Scale>>;
}

export function createRatioDatasets<
  Key extends string,
  Scale extends ResourceScale,
>({
  sourceDataset,
  price,
  key,
}: {
  key: Key;
  sourceDataset: Dataset<Scale>;
  price: Dataset<Scale>;
}) {
  return appendRatioLazyDatasets({
    datasets: {},
    key,
    sourceDataset,
    price,
  });
}
