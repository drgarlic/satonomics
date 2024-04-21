import {
  appendRatioLazyDatasets,
  // appendRatioLazyDatasets,
  createBLSHBitcoinReturnsLazyDataset,
  createBLSHDollarReturnsLazyDataset,
  createCumulatedLazyDataset,
  createDividedLazyDataset,
  createNetChangeLazyDataset,
  createPercentageMomentumLazyDataset,
  createSubtractedLazyDataset,
  createTransformedLazyDataset,
} from "../../base";

// import { addressCohortsKeys, liquidities } from "./address";
// import { ageCohortsKeys } from "./age";

export const createLazyCommonCohortDatasets = <
  Scale extends ResourceScale,
  Key extends string,
>({
  key,
  // datasets,
  price,
  marketCapitalization,
  supplyTotal,
  cohortSupplyTotal,
  supplyInProfit,
  realizedLoss,
  realizedProfit,
  unrealizedLoss,
  unrealizedProfit,
  realizedCapitalization,
}: {
  key: Key;
  // datasets: Partial<Record<`${Key}${LazyCohortDataset}`, Dataset<Scale>>>;
  price: Dataset<Scale>;
  marketCapitalization: Dataset<Scale>;
  supplyTotal: ResourceDataset<Scale>;
  cohortSupplyTotal: ResourceDataset<Scale>;
  supplyInProfit: ResourceDataset<Scale>;
  realizedLoss: ResourceDataset<Scale>;
  realizedProfit: ResourceDataset<Scale>;
  unrealizedLoss: ResourceDataset<Scale>;
  unrealizedProfit: ResourceDataset<Scale>;
  realizedCapitalization: ResourceDataset<Scale>;
}) => {
  type Datasets = Record<`${Key}${LazyCohortDataset}`, Dataset<Scale>>;

  const datasets: Partial<Datasets> = {};
  // type PossibleKeys = `${AnyPossibleCohortKey}${LazyCohortDataset}`;

  // const datasets: Partial<Record<PossibleKeys, Dataset<Scale>>> = {};

  const realizedNet = createSubtractedLazyDataset(realizedProfit, realizedLoss);

  const unrealizedNet = createSubtractedLazyDataset(
    unrealizedProfit,
    unrealizedLoss,
  );

  const supplyInLoss = createSubtractedLazyDataset(
    cohortSupplyTotal,
    supplyInProfit,
  );

  const supplyInProfitPercentageSelf = createDividedLazyDataset(
    supplyInProfit,
    cohortSupplyTotal,
    true,
  );

  const cumulatedNetRealized = createCumulatedLazyDataset(realizedNet);

  const realizedPrice = createDividedLazyDataset(
    realizedCapitalization,
    cohortSupplyTotal,
  );

  datasets[`${key}RealizedLossNegative`] = createTransformedLazyDataset(
    realizedLoss,
    (v) => -v,
  );

  datasets[`${key}UnrealizedLossNegative`] = createTransformedLazyDataset(
    unrealizedLoss,
    (v) => -v,
  );

  datasets[`${key}CumulatedRealizedProfit`] =
    createCumulatedLazyDataset(realizedProfit);

  datasets[`${key}CumulatedRealizedLoss`] =
    createCumulatedLazyDataset(realizedLoss);

  datasets[`${key}NetRealizedProfitAndLoss`] = realizedNet;
  datasets[`${key}RelativeNetRealizedProfitAndLoss`] = createDividedLazyDataset(
    realizedNet,
    marketCapitalization,
  );

  datasets[`${key}CumulatedNetRealizedProfitAndLoss`] = cumulatedNetRealized;
  datasets[`${key}CumulatedNetRealizedProfitAndLoss30dChange`] =
    createNetChangeLazyDataset(cumulatedNetRealized, 30);

  datasets[`${key}NetUnrealizedProfitAndLoss`] = unrealizedNet;
  datasets[`${key}RelativeNetUnrealizedProfitAndLoss`] =
    createDividedLazyDataset(unrealizedNet, marketCapitalization);

  datasets[`${key}SupplyTotal%All`] = createDividedLazyDataset(
    cohortSupplyTotal,
    supplyTotal,
    true,
  );

  datasets[`${key}SupplyInProfit%All`] = createDividedLazyDataset(
    supplyInProfit,
    supplyTotal,
    true,
  );

  datasets[`${key}SupplyInProfit%Self`] = supplyInProfitPercentageSelf;

  datasets[`${key}SupplyInLoss`] = supplyInLoss;

  datasets[`${key}SupplyInLoss%All`] = createDividedLazyDataset(
    supplyInLoss,
    supplyTotal,
    true,
  );

  const percentageMomentum = createPercentageMomentumLazyDataset(
    supplyInProfitPercentageSelf,
  );

  datasets[`${key}SupplyPNL%SelfMomentum`] = percentageMomentum;

  const percentageMomentumBLSHBitcoinReturns =
    createBLSHBitcoinReturnsLazyDataset({
      momentumDataset: percentageMomentum,
      price,
    });

  datasets[`${key}SupplyPNL%SelfMomentumBLSHBitcoinReturns`] =
    percentageMomentumBLSHBitcoinReturns;

  datasets[`${key}SupplyPNL%SelfMomentumBLSHDollarReturns`] =
    createBLSHDollarReturnsLazyDataset({
      bitcoinReturns: percentageMomentumBLSHBitcoinReturns,
    });

  datasets[`${key}SupplyInLoss%Self`] = createDividedLazyDataset(
    supplyInLoss,
    cohortSupplyTotal,
    true,
  );

  datasets[`${key}SupplyTotal75Percent`] = createTransformedLazyDataset(
    cohortSupplyTotal,
    (v) => v * 0.75,
  );

  datasets[`${key}SupplyTotal50Percent`] = createTransformedLazyDataset(
    cohortSupplyTotal,
    (v) => v * 0.5,
  );

  datasets[`${key}SupplyTotal25Percent`] = createTransformedLazyDataset(
    cohortSupplyTotal,
    (v) => v * 0.25,
  );

  datasets[`${key}RealizedPrice`] = realizedPrice;
  datasets[`${key}PricePaidMean`] = realizedPrice;

  datasets[`${key}RealizedCapitalization30dChange`] =
    createNetChangeLazyDataset(realizedCapitalization, 30);

  // TODO: Fix `ResourceScale`
  appendRatioLazyDatasets({
    datasets,
    sourceDataset: realizedPrice,
    price,
    key: `${key}RealizedPrice`,
  });

  return datasets as Datasets;
};
