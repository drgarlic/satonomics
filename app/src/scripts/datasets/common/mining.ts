import {
  createAnnualizedLazyDataset,
  createCumulatedLazyDataset,
  createDividedLazyDataset,
  createLazyAverageDataset,
  createMultipliedLazyDataset,
  createResourceDataset,
  createSubtractedLazyDataset,
} from "../base";

export function createMiningDatasets<Scale extends ResourceScale>({
  scale,
  price,
  supplyTotal,
}: {
  scale: Scale;
  price: Dataset<Scale>;
  supplyTotal: Dataset<Scale>;
}) {
  const newBlocks = createResourceDataset({
    scale,
    path: `/${scale}-to-block_count`,
  });

  const subsidy = createResourceDataset({
    scale,
    path: `/${scale}-to-subsidy`,
  });

  const subsidyInDollars = createResourceDataset({
    scale,
    path: `/${scale}-to-subsidy_in_dollars`,
  });

  const lastSubsidy = createResourceDataset({
    scale,
    path: `/${scale}-to-last_subsidy`,
  });

  const fees = createResourceDataset({
    scale,
    path: `/${scale}-to-fees-sumed`,
  });

  const issuanceAnnualized = createAnnualizedLazyDataset(subsidy);

  return {
    issuanceAnnualized,
    newBlocks,
    subsidy,
    subsidyInDollars,
    lastSubsidy,
    fees,
    yearlyInflationRate: createDividedLazyDataset(
      issuanceAnnualized,
      supplyTotal,
      true,
    ),
    supplyTotalAtMinus1Block: createSubtractedLazyDataset(
      supplyTotal,
      lastSubsidy,
    ),
    newBlocks7dSMA: createLazyAverageDataset(newBlocks, 7),
    newBlocks30dSMA: createLazyAverageDataset(newBlocks, 30),
    blocksTotal: createCumulatedLazyDataset(newBlocks),
    lastSubsidyInDollars: createMultipliedLazyDataset(lastSubsidy, price),
  };
}
