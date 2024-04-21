import {
  createAddedLazyDataset,
  createNetChangeLazyDataset,
  createResourceDataset,
  createSubtractedLazyDataset,
} from "../base";

export function createMarketCapitalizationDatasets(
  marketCapitalization: Dataset<"date">,
) {
  const scale = "date" as const;

  const combinedMarketCapitalizationsMinusBitcoins = createResourceDataset({
    scale,
    path: `/date-to-altcoins-marketcap`,
  });

  const fiatcoinsMarketCapitalization = createResourceDataset({
    scale,
    path: `/date-to-stablecoins-marketcap`,
  });

  return {
    combinedMarketCapitalizations: createAddedLazyDataset(
      marketCapitalization,
      combinedMarketCapitalizationsMinusBitcoins,
    ),
    combinedMarketCapitalizationsMinusBitcoins,
    scamcoinsMarketCapitalization: createSubtractedLazyDataset(
      combinedMarketCapitalizationsMinusBitcoins,
      fiatcoinsMarketCapitalization,
    ),
    fiatcoinsMarketCapitalization,
    fiatcoinsMarketCapitalization30dChange: createNetChangeLazyDataset(
      fiatcoinsMarketCapitalization,
      30,
    ),
  };
}
