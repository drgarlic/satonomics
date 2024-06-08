// import { anyCohortDatasets } from ".";
// import { createResourceDataset } from "../../base";
// import { createLazyCommonCohortDatasets } from "./addons";

// export function createAddressCohortDatasets<Scale extends ResourceScale>({
//   scale,
//   price,
//   marketCapitalization,
//   supplyTotal,
//   setActiveResources,
// }: {
//   scale: Scale;
//   price: Dataset<Scale>;
//   marketCapitalization: Dataset<Scale>;
//   supplyTotal: ResourceDataset<Scale>;
//   setActiveResources: Setter<Set<ResourceDataset<any, any>>>;
// }) {
//   const addressDatasets = [...anyCohortDatasets, ...addressOnlyDatasets];

//   type ResourceDatasets = Record<
//     `${AddressCohortKey}${"" | LiquidityKey}${AddressCohortDatasetKey}`,
//     ResourceDataset<Scale>
//   >;

//   type LazyDatasets = Record<
//     `${AddressCohortKey}${"" | LiquidityKey}${LazyCohortDataset}`,
//     Dataset<Scale>
//   >;

//   const resourcePartials: Partial<ResourceDatasets> = {};
//   const lazyPartials: Partial<LazyDatasets> = {};

//   addressCohorts.forEach(({ key: addressKey, route: addressRoute }) => {
//     type CohortDatasets = Record<
//       `${typeof addressKey}${"" | LiquidityKey}${AddressCohortDatasetKey}`,
//       ResourceDataset<Scale>
//     >;

//     const partial: Partial<CohortDatasets> = {};

//     addressDatasets.forEach(
//       ({ key: cohortKey, route: cohortAttributeRoute }) => {
//         const attributeName = `${addressKey}${cohortKey}` as const;

//         const resource = createResourceDataset({
//           scale,
//           path: `/${scale}-to-${addressRoute}-${cohortAttributeRoute}`,
//           setActiveResources,
//         });

//         partial[attributeName] = resource;

//         liquidities.forEach((liquidity) => {
//           const attributeName =
//             `${addressKey}${liquidity.key}${cohortKey}` as const;

//           const resource = createResourceDataset({
//             scale,
//             path: `/${scale}-to-${addressRoute}-${liquidity.route}-${cohortAttributeRoute}`,
//             setActiveResources,
//           });

//           partial[attributeName] = resource;
//         });
//       },
//     );

//     const fullResources = partial as CohortDatasets;
//     Object.assign(resourcePartials, fullResources);

//     ["" as const, ...liquidities.map(({ key }) => key)].forEach(
//       (liquidityKey) => {
//         const key = `${addressKey}${liquidityKey}` as const;

//         const lazyDatasets = createLazyCommonCohortDatasets({
//           key,
//           price,
//           marketCapitalization,
//           supplyTotal,
//           cohortSupplyTotal: fullResources[`${key}SupplyTotal`],
//           supplyInProfit: fullResources[`${key}SupplyInProfit`],
//           realizedLoss: fullResources[`${key}RealizedLoss`],
//           realizedProfit: fullResources[`${key}RealizedProfit`],
//           unrealizedLoss: fullResources[`${key}UnrealizedLoss`],
//           unrealizedProfit: fullResources[`${key}UnrealizedProfit`],
//           realizedCapitalization: fullResources[`${key}RealizedCapitalization`],
//         });
//         Object.assign(lazyPartials, lazyDatasets);
//       },
//     );
//   });

//   return {
//     ...(resourcePartials as ResourceDatasets),
//     ...(lazyPartials as LazyDatasets),
//   };
// }

export const addressCohortsBySize = [
  {
    key: "plankton",
    name: "Plankton",
  },
  {
    key: "shrimp",
    name: "Shrimp",
  },
  { key: "crab", name: "Crab" },
  { key: "fish", name: "Fish" },
  { key: "shark", name: "Shark" },
  { key: "whale", name: "Whale" },
  { key: "humpback", name: "Humpback" },
  { key: "megalodon", name: "Megalodon" },
] as const;

export const addressCohortsByType = [
  { key: "p2pk", name: "P2PK" },
  { key: "p2pkh", name: "P2PKH" },
  { key: "p2sh", name: "P2SH" },
  { key: "p2wpkh", name: "P2WPKH" },
  { key: "p2wsh", name: "P2WSH" },
  { key: "p2tr", name: "P2TR" },
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
    key: "illiquid",
    name: "Illiquid",
  },
  { key: "liquid", name: "Liquid" },
  {
    key: "highly_liquid",
    name: "Highly Liquid",
  },
] as const;
