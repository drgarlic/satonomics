import {
  createAnnualizedLazyDataset,
  createDividedLazyDataset,
  createResourceDataset,
} from "../base";

export function createTransactionsDatasets<Scale extends ResourceScale>({
  supplyTotal,
  setActiveResources,
}: {
  supplyTotal: Dataset<Scale>;
  setActiveResources: Setter<Set<ResourceDataset<any, any>>>;
}) {
  const scale = supplyTotal.scale;

  const transactionCount = createResourceDataset({
    scale,
    path: `/${scale}-to-transaction-count`,
    setActiveResources,
  });

  const transactionVolume = createResourceDataset({
    scale,
    path: `/${scale}-to-transaction-volume`,
    setActiveResources,
  });

  const transactionVolumeAnnualized =
    createAnnualizedLazyDataset(transactionVolume);

  const transactionsVelocity = createDividedLazyDataset(
    transactionVolumeAnnualized,
    supplyTotal,
  );

  return {
    transactionCount,
    transactionVolume,
    transactionVolumeAnnualized,
    transactionsVelocity,
  };
}
