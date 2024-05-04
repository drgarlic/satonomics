import { createAddressesDatasets } from "./addresses";
import {
  createAddressCohortDatasets,
  createAgeCohortDatasets,
} from "./cohorts";
import { createCointimeDatasets } from "./cointime";
import { createMiningDatasets } from "./mining";
import { createTransactionsDatasets } from "./transactions";
import { createValuesDatasets } from "./values";

export function createCommonDatasets<Scale extends ResourceScale>({
  price,
  setActiveResources,
}: {
  price: Dataset<Scale>;
  setActiveResources: Setter<Set<ResourceDataset<any, any>>>;
}) {
  const scale = price.scale;

  const ageCohorts = createAgeCohortDatasets({
    scale,
    price,
    setActiveResources,
  });

  const { SupplyTotal: supplyTotal, marketCapitalization } = ageCohorts;

  const addressCohorts = createAddressCohortDatasets({
    scale,
    marketCapitalization,
    price,
    supplyTotal,
    setActiveResources,
  });

  const transactionsDatasets = createTransactionsDatasets({
    supplyTotal,
    setActiveResources,
  });

  const miningDatasets = createMiningDatasets({
    scale,
    price,
    supplyTotal,
    setActiveResources,
  });

  const addresses = createAddressesDatasets({ scale, setActiveResources });

  const cointime = createCointimeDatasets({
    cumulatedNetRealizedProfitAndLoss:
      ageCohorts.CumulatedNetRealizedProfitAndLoss,
    lastSubsidy: miningDatasets.lastSubsidy,
    newBlocks: miningDatasets.newBlocks,
    price,
    supplyTotal: ageCohorts.SupplyTotal,
    realizedPrice: ageCohorts.RealizedPrice,
    subsidyInDollars: miningDatasets.subsidyInDollars,
    supplyTotalAtMinus1Block: miningDatasets.supplyTotalAtMinus1Block,
    transactionVolumeAnnualized:
      transactionsDatasets.transactionVolumeAnnualized,
    yearlyInflationRate: miningDatasets.yearlyInflationRate,
    setActiveResources,
  });

  const values = createValuesDatasets(price);

  return {
    ...ageCohorts,
    ...addressCohorts,
    ...miningDatasets,
    ...transactionsDatasets,
    ...addresses,
    ...cointime,
    ...values,
  };
}
