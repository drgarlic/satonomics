import { anyCohortDatasets } from ".";
import { createResourceDataset } from "../../base";
import { createLazyCommonCohortDatasets } from "./addons";

export function createAddressCohortDatasets<Scale extends ResourceScale>({
  scale,
  price,
  marketCapitalization,
  supplyTotal,
}: {
  scale: Scale;
  price: Dataset<Scale>;
  marketCapitalization: Dataset<Scale>;
  supplyTotal: ResourceDataset<Scale>;
}) {
  const addressDatasets = [...anyCohortDatasets, ...addressOnlyDatasets];

  type ResourceDatasets = Record<
    `${AddressCohortKey}${"" | LiquidityKey}${AddressCohortDatasetKey}`,
    ResourceDataset<Scale>
  >;

  type LazyDatasets = Record<
    `${AddressCohortKey}${"" | LiquidityKey}${LazyCohortDataset}`,
    Dataset<Scale>
  >;

  const resourcePartials: Partial<ResourceDatasets> = {};
  const lazyPartials: Partial<LazyDatasets> = {};

  addressCohorts.forEach(({ key: addressKey, route: addressRoute }) => {
    type CohortDatasets = Record<
      `${typeof addressKey}${"" | LiquidityKey}${AddressCohortDatasetKey}`,
      ResourceDataset<Scale>
    >;

    const partial: Partial<CohortDatasets> = {};

    addressDatasets.forEach(
      ({ key: cohortKey, route: cohortAttributeRoute }) => {
        const attributeName = `${addressKey}${cohortKey}` as const;

        const resource = createResourceDataset({
          scale,
          path: `/${scale}-to-${addressRoute}-${cohortAttributeRoute}`,
        });

        partial[attributeName] = resource;

        liquidities.forEach((liquidity) => {
          const attributeName =
            `${addressKey}${liquidity.key}${cohortKey}` as const;

          const resource = createResourceDataset({
            scale,
            path: `/${scale}-to-${addressRoute}-${liquidity.route}-${cohortAttributeRoute}`,
          });

          partial[attributeName] = resource;
        });
      },
    );

    const fullResources = partial as CohortDatasets;
    Object.assign(resourcePartials, fullResources);

    ["" as const, ...liquidities.map(({ key }) => key)].forEach(
      (liquidityKey) => {
        const key = `${addressKey}${liquidityKey}` as const;

        const lazyDatasets = createLazyCommonCohortDatasets({
          key,
          price,
          marketCapitalization,
          supplyTotal,
          cohortSupplyTotal: fullResources[`${key}SupplyTotal`],
          supplyInProfit: fullResources[`${key}SupplyInProfit`],
          realizedLoss: fullResources[`${key}RealizedLoss`],
          realizedProfit: fullResources[`${key}RealizedProfit`],
          unrealizedLoss: fullResources[`${key}UnrealizedLoss`],
          unrealizedProfit: fullResources[`${key}UnrealizedProfit`],
          realizedCapitalization: fullResources[`${key}RealizedCapitalization`],
        });
        Object.assign(lazyPartials, lazyDatasets);
      },
    );
  });

  return {
    ...(resourcePartials as ResourceDatasets),
    ...(lazyPartials as LazyDatasets),
  };
}

export const addressCohortsBySize = [
  {
    key: "plankton",
    name: "Plankton",
    route: "plankton",
  },
  {
    key: "shrimp",
    name: "Shrimp",
    route: "shrimp",
  },
  { key: "crab", name: "Crab", route: "crab" },
  { key: "fish", name: "Fish", route: "fish" },
  { key: "shark", name: "Shark", route: "shark" },
  { key: "whale", name: "Whale", route: "whale" },
  { key: "humpback", name: "Humpback", route: "humpback" },
  { key: "megalodon", name: "Megalodon", route: "megalodon" },
] as const;

export const addressCohortsByType = [
  { key: "p2pk", name: "P2PK", route: "p2pk" },
  { key: "p2pkh", name: "P2PKH", route: "p2pkh" },
  { key: "p2sh", name: "P2SH", route: "p2sh" },
  { key: "p2wpkh", name: "P2WPKH", route: "p2wpkh" },
  { key: "p2wsh", name: "P2WSH", route: "p2wsh" },
  { key: "p2tr", name: "P2TR", route: "p2tr" },
] as const;

export const addressCohorts = [
  ...addressCohortsBySize,
  ...addressCohortsByType,
] as const;

// export const addressCohortsKeys = addressCohorts.map(({ key }) => key);

export const addressOnlyDatasets = [
  {
    key: "AddressCount",
    route: "address_count",
  },
] as const;

export const liquidities = [
  {
    key: "Illiquid",
    name: "Illiquid",
    route: "illiquid",
  },
  { key: "Liquid", name: "Liquid", route: "liquid" },
  {
    key: "HighlyLiquid",
    name: "Highly Liquid",
    route: "highly_liquid",
  },
] as const;
