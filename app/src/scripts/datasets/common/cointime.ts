import {
  createCumulatedLazyDataset,
  createDividedLazyDataset,
  createMedianLazyDataset,
  createMultipliedLazyDataset,
  createNetChangeLazyDataset,
  createRatioDatasets,
  createResourceDataset,
  createSubtractedLazyDataset,
  createTransformedLazyDataset,
} from "../base";

export function createCointimeDatasets<Scale extends ResourceScale>({
  price,
  supplyTotal,
  lastSubsidy,
  subsidyInDollars,
  newBlocks,
  realizedPrice,
  yearlyInflationRate,
  cumulatedNetRealizedProfitAndLoss,
  supplyTotalAtMinus1Block,
  transactionVolumeAnnualized,
  setActiveResources,
}: {
  price: Dataset<Scale>;
  supplyTotal: Dataset<Scale>;
  lastSubsidy: Dataset<Scale>;
  subsidyInDollars: Dataset<Scale>;
  newBlocks: Dataset<Scale>;
  realizedPrice: Dataset<Scale>;
  yearlyInflationRate: Dataset<Scale>;
  transactionVolumeAnnualized: Dataset<Scale>;
  supplyTotalAtMinus1Block: Dataset<Scale>;
  cumulatedNetRealizedProfitAndLoss: Dataset<Scale>;
  setActiveResources: Setter<Set<ResourceDataset<any, any>>>;
}) {
  const scale = price.scale;

  const coinblocksDestroyed = createResourceDataset({
    scale,
    path: `/${scale}-to-coinblocks-destroyed`,
    setActiveResources,
  });

  const coinblocksCreated = createMultipliedLazyDataset(supplyTotal, newBlocks);

  const coinblocksStored = createSubtractedLazyDataset(
    coinblocksCreated,
    coinblocksDestroyed,
  );

  const cumulatedCoinblocksCreated =
    createCumulatedLazyDataset(coinblocksCreated);

  const cumulatedCoinblocksDestroyed =
    createCumulatedLazyDataset(coinblocksDestroyed);

  const cumulatedCoinblocksStored =
    createCumulatedLazyDataset(coinblocksStored);

  const liveliness = createDividedLazyDataset(
    cumulatedCoinblocksDestroyed,
    cumulatedCoinblocksCreated,
  );

  const vaultedness = createTransformedLazyDataset(
    liveliness,
    (value) => 1 - value,
  );

  const activityToVaultednessRatio = createDividedLazyDataset(
    liveliness,
    vaultedness,
  );

  const concurrentLiveliness = createDividedLazyDataset(
    coinblocksDestroyed,
    coinblocksCreated,
  );

  const concurrentLiveliness14dMedian = createMedianLazyDataset(
    concurrentLiveliness,
    14,
  );

  const livelinessIncrementalChange = createNetChangeLazyDataset(liveliness);

  const livelinessIncrementalChange14dMedian = createMedianLazyDataset(
    livelinessIncrementalChange,
    14,
  );

  const vaultedSupply = createMultipliedLazyDataset(vaultedness, supplyTotal);

  const vaultedSupplyNetChange = createNetChangeLazyDataset(vaultedSupply);

  const vaultedSupply90dNetChange = createNetChangeLazyDataset(
    vaultedSupply,
    90,
  );

  const vaultedSupplyNetChangeX365 = createTransformedLazyDataset(
    vaultedSupplyNetChange,
    (value) => value * 365,
  );

  const vaultingRate = createDividedLazyDataset(
    vaultedSupplyNetChangeX365,
    supplyTotal,
    true,
  );

  const activeSupply = createMultipliedLazyDataset(liveliness, supplyTotal);

  const activeSupplyNetChange = createNetChangeLazyDataset(activeSupply);

  const activeSupply90dNetChange = createNetChangeLazyDataset(activeSupply, 90);

  // TODO: Fix, is always 0, but it shouldn't since some coins (~35 BTC) are lost
  const dateToMinVaultedSupply = createTransformedLazyDataset(
    supplyTotal,
    (value, index) =>
      value / (cumulatedCoinblocksCreated.values()?.at(index)?.value || 0),
  );

  const dateToMaxActiveSupply = createTransformedLazyDataset(
    supplyTotal,
    (value, index) =>
      value *
      (1 -
        value / (cumulatedCoinblocksCreated.values()?.at(index)?.value || 0)),
  );

  const cointimeAdjustedYearlyInflationRate = createMultipliedLazyDataset(
    yearlyInflationRate,
    activityToVaultednessRatio,
  );

  const cointimeAdjustedVelocity = createDividedLazyDataset(
    transactionVolumeAnnualized,
    activeSupply,
  );

  const activeSupplyChangeFromTransactions = createMultipliedLazyDataset(
    supplyTotalAtMinus1Block,
    concurrentLiveliness,
  );

  const activeSupplyChangeFromTransactions90dChange =
    createNetChangeLazyDataset(activeSupplyChangeFromTransactions, 90);

  const activeSupplyChangeFromIssuance = createMultipliedLazyDataset(
    lastSubsidy,
    liveliness,
  );

  const thermoCap = createCumulatedLazyDataset(subsidyInDollars);

  const investorCapitalization = createSubtractedLazyDataset(
    cumulatedNetRealizedProfitAndLoss,
    thermoCap,
  );

  const thermoCapToInvestorCapRatio = createDividedLazyDataset(
    thermoCap,
    investorCapitalization,
    true,
  );

  const activeSupplyChangeFromIssuance90dChange = createNetChangeLazyDataset(
    activeSupplyChangeFromIssuance,
    90,
  );

  const activePrice = createDividedLazyDataset(realizedPrice, liveliness);

  const vaultedPrice = createDividedLazyDataset(realizedPrice, vaultedness);

  const trueMarketMean = createDividedLazyDataset(
    investorCapitalization,
    activeSupply,
  );

  return {
    coinblocksDestroyed,
    activeSupply,
    activeSupply90dNetChange,
    activeSupplyChangeFromIssuance,
    activeSupplyChangeFromIssuance90dChange,
    activeSupplyChangeFromTransactions,
    activeSupplyChangeFromTransactions90dChange,
    activeSupplyNetChange,
    activityToVaultednessRatio,
    coinblocksCreated,
    coinblocksStored,
    cointimeAdjustedVelocity,
    cointimeAdjustedYearlyInflationRate,
    concurrentLiveliness,
    concurrentLiveliness14dMedian,
    cumulatedCoinblocksCreated,
    cumulatedCoinblocksDestroyed,
    cumulatedCoinblocksStored,
    liveliness,
    livelinessIncrementalChange,
    livelinessIncrementalChange14dMedian,
    investorCapitalization,
    dateToMaxActiveSupply,
    dateToMinVaultedSupply,
    vaultedness,
    vaultedSupply,
    vaultedSupply90dNetChange,
    vaultedSupplyNetChange,
    vaultingRate,
    thermoCap,
    thermoCapToInvestorCapRatio,
    activePrice,
    ...createRatioDatasets({
      sourceDataset: activePrice,
      key: "activePrice" as const,
      price,
    }),
    vaultedPrice,
    ...createRatioDatasets({
      sourceDataset: vaultedPrice,
      key: "vaultedPrice" as const,
      price,
    }),
    trueMarketMean,
    ...createRatioDatasets({
      sourceDataset: trueMarketMean,
      key: "trueMarketMean" as const,
      price,
    }),
  };
}
