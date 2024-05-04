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
  setActiveResources,
}: {
  scale: Scale;
  price: Dataset<Scale>;
  supplyTotal: Dataset<Scale>;
  setActiveResources: Setter<Set<ResourceDataset<any, any>>>;
}) {
  const newBlocks = createResourceDataset({
    scale,
    path: `/${scale}-to-block_count`,
    setActiveResources,
  });

  const subsidy = createResourceDataset({
    scale,
    path: `/${scale}-to-subsidy`,
    setActiveResources,
  });

  const subsidyInDollars = createResourceDataset({
    scale,
    path: `/${scale}-to-subsidy_in_dollars`,
    setActiveResources,
  });

  const lastSubsidy = createResourceDataset({
    scale,
    path: `/${scale}-to-last_subsidy`,
    setActiveResources,
  });

  const fees = createResourceDataset({
    scale,
    path: `/${scale}-to-fees-sumed`,
    setActiveResources,
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
