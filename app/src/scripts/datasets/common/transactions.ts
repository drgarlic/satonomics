import {
  createAnnualizedLazyDataset,
  createDividedLazyDataset,
  createResourceDataset,
} from "../base";

export function createTransactionsDatasets<Scale extends ResourceScale>(
  supplyTotal: Dataset<Scale>,
) {
  const scale = supplyTotal.scale;

  const transactionCount = createResourceDataset({
    scale,
    path: `/${scale}-to-transaction-count`,
  });

  const transactionVolume = createResourceDataset({
    scale,
    path: `/${scale}-to-transaction-volume`,
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
