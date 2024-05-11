import { anyCohortDatasets } from ".";
import { createMultipliedLazyDataset, createResourceDataset } from "../../base";
import { createLazyCommonCohortDatasets } from "./addons";

export function createAgeCohortDatasets<Scale extends ResourceScale>({
  scale,
  price,
  setActiveResources,
}: {
  scale: Scale;
  price: Dataset<Scale>;
  setActiveResources: Setter<Set<ResourceDataset<any, any>>>;
}) {
  const ageDatasets = [...anyCohortDatasets];

  type ResourceDatasets = Record<
    `${AgeCohortKey}${AgeCohortDatasetKey}`,
    ResourceDataset<Scale>
  >;

  type LazyDatasets = Record<
    `${AgeCohortKey}${LazyCohortDataset}`,
    Dataset<Scale>
  >;

  const resourcePartials: Partial<ResourceDatasets> = {};
  const lazyPartials: Partial<LazyDatasets> = {};

  ageCohorts.forEach(({ key }) => {
    type CohortDatasets = Record<
      `${typeof key}${AgeCohortDatasetKey}`,
      ResourceDataset<Scale>
    >;

    const partial: Partial<CohortDatasets> = {};

    ageDatasets.forEach(({ key: cohortKey, route: cohortRoute }) => {
      const attributeName = `${key}${cohortKey}` as const;

      const resource = createResourceDataset({
        scale,
        path: `/${scale}-to-${key ? key + "-" : ""}${cohortRoute}`,
        setActiveResources,
      });

      partial[attributeName] = resource;
    });

    const fullResources = partial as CohortDatasets;
    Object.assign(resourcePartials, fullResources);
  });

  const resources = resourcePartials as ResourceDatasets;

  const supplyTotal = resources.SupplyTotal;

  const marketCapitalization = createMultipliedLazyDataset(supplyTotal, price);

  ageCohorts.forEach(({ key }) => {
    const lazyDatasets = createLazyCommonCohortDatasets({
      key,
      price,
      marketCapitalization,
      supplyTotal,
      cohortSupplyTotal: resources[`${key}SupplyTotal`],
      supplyInProfit: resources[`${key}SupplyInProfit`],
      realizedLoss: resources[`${key}RealizedLoss`],
      realizedProfit: resources[`${key}RealizedProfit`],
      unrealizedLoss: resources[`${key}UnrealizedLoss`],
      unrealizedProfit: resources[`${key}UnrealizedProfit`],
      realizedCapitalization: resources[`${key}RealizedCapitalization`],
    });

    Object.assign(lazyPartials, lazyDatasets);
  });

  return {
    marketCapitalization,
    ...resources,
    ...(lazyPartials as LazyDatasets),
  };
}

export const xthCohorts = [
  {
    key: "lth",
    name: "LTH - Long Term Holders",
  },
  {
    key: "sth",
    name: "STH - Short Term Holders",
  },
] as const;

export const upToCohorts = [
  { key: "up_to_1d", name: "Up To 1 Day" },
  { key: "up_to_1w", name: "Up To 1 Week" },
  { key: "up_to_1m", name: "Up To 1 Month" },
  { key: "up_to_2m", name: "Up To 2 Months" },
  { key: "up_to_3m", name: "Up To 3 Months" },
  { key: "up_to_4m", name: "Up To 4 Months" },
  { key: "up_to_5m", name: "Up To 5 Months" },
  { key: "up_to_6m", name: "Up To 6 Months" },
  { key: "up_to_1y", name: "Up To 1 Year" },
  { key: "up_to_2y", name: "Up To 2 Years" },
  { key: "up_to_3y", name: "Up To 3 Years" },
  { key: "up_to_5y", name: "Up To 5 Years" },
  { key: "up_to_7y", name: "Up To 7 Yeats" },
  { key: "up_to_10y", name: "Up To 10 Years" },
] as const;

export const fromXToYCohorts = [
  {
    key: "from_1d_to_1w",
    name: "From 1 Day To 1 Week",
  },
  {
    key: "from_1w_to_1m",
    name: "From 1 Week To 1 Month",
  },
  {
    key: "from_1m_to_3m",
    name: "From 1 Month To 3 Months",
  },
  {
    key: "from_3m_to_6m",
    name: "From 3 Months To 6 Months",
  },
  {
    key: "from_6m_to_1y",
    name: "From 6 Months To 1 Year",
  },
  {
    key: "from_1y_to_2y",
    name: "From 1 Year To 2 Years",
  },
  {
    key: "from_2y_to_3y",
    name: "From 2 Years To 3 Years",
  },
  {
    key: "from_3y_to_5y",
    name: "From 3 Years To 5 Years",
  },
  {
    key: "from_5y_to_7y",
    name: "From 5 Years To 7 Years",
  },
  {
    key: "from_7y_to_10y",
    name: "From 7 Years To 10 Years",
  },
] as const;

export const fromXCohorts = [
  {
    key: "from_1y",
    name: "From 1 Year",
  },
  {
    key: "from_2y",
    name: "From 2 Years",
  },
  {
    key: "from_4y",
    name: "From 4 Years",
  },
  {
    key: "from_10y",
    name: "From 10 Years",
  },
] as const;

export const yearCohorts = [
  { key: "2009", name: "2009" },
  { key: "2010", name: "2010" },
  { key: "2011", name: "2011" },
  { key: "2012", name: "2012" },
  { key: "2013", name: "2013" },
  { key: "2014", name: "2014" },
  { key: "2015", name: "2015" },
  { key: "2016", name: "2016" },
  { key: "2017", name: "2017" },
  { key: "2018", name: "2018" },
  { key: "2019", name: "2019" },
  { key: "2020", name: "2020" },
  { key: "2021", name: "2021" },
  { key: "2022", name: "2022" },
  { key: "2023", name: "2023" },
  { key: "2024", name: "2024" },
] as const;

export const ageCohorts = [
  {
    key: "",
    name: "",
  },
  ...xthCohorts,
  ...upToCohorts,
  ...fromXToYCohorts,
  ...fromXCohorts,
  ...yearCohorts,
] as const;
