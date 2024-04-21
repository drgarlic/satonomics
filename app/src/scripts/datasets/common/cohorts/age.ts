import { anyCohortDatasets } from ".";
import { createMultipliedLazyDataset, createResourceDataset } from "../../base";
import { createLazyCommonCohortDatasets } from "./addons";

export function createAgeCohortDatasets<Scale extends ResourceScale>({
  scale,
  price,
}: {
  scale: Scale;
  price: Dataset<Scale>;
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

  ageCohorts.forEach(({ key: ageKey, route: ageRoute }) => {
    type CohortDatasets = Record<
      `${typeof ageKey}${AgeCohortDatasetKey}`,
      ResourceDataset<Scale>
    >;

    const partial: Partial<CohortDatasets> = {};

    ageDatasets.forEach(({ key: cohortKey, route: cohortRoute }) => {
      const attributeName = `${ageKey}${cohortKey}` as const;

      const resource = createResourceDataset({
        scale,
        path: `/${scale}-to-${ageRoute ? ageRoute + "-" : ""}${cohortRoute}`,
      });

      partial[attributeName] = resource;
    });

    const fullResources = partial as CohortDatasets;
    Object.assign(resourcePartials, fullResources);
  });

  const resources = resourcePartials as ResourceDatasets;

  const supplyTotal = resources.SupplyTotal;

  const marketCapitalization = createMultipliedLazyDataset(supplyTotal, price);

  ageCohorts.forEach(({ key: ageKey, route: ageRoute }) => {
    const key = ageKey;

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
    route: "lth",
  },
  {
    key: "sth",
    name: "STH - Short Term Holders",
    route: "sth",
  },
] as const;

export const upToCohorts = [
  { key: "upTo1d", name: "Up To 1 Day", route: "up_to_1d" },
  { key: "upTo1w", name: "Up To 1 Week", route: "up_to_7d" },
  { key: "upTo1m", name: "Up To 1 Month", route: "up_to_1m" },
  { key: "upTo2m", name: "Up To 2 Months", route: "up_to_2m" },
  { key: "upTo3m", name: "Up To 3 Months", route: "up_to_3m" },
  { key: "upTo4m", name: "Up To 4 Months", route: "up_to_4m" },
  { key: "upTo5m", name: "Up To 5 Months", route: "up_to_5m" },
  { key: "upTo6m", name: "Up To 6 Months", route: "up_to_6m" },
  { key: "upTo1y", name: "Up To 1 Year", route: "up_to_1y" },
  { key: "upTo2y", name: "Up To 2 Years", route: "up_to_2y" },
  { key: "upTo3y", name: "Up To 3 Years", route: "up_to_3y" },
  { key: "upTo5y", name: "Up To 5 Years", route: "up_to_5y" },
  { key: "upTo7y", name: "Up To 7 Yeats", route: "up_to_7y" },
  { key: "upTo10y", name: "Up To 10 Years", route: "up_to_10y" },
] as const;

export const fromXToYCohorts = [
  { key: "from1dTo1w", name: "From 1 Day To 1 Week", route: "from_1d_to_7d" },
  { key: "from1wTo1m", name: "From 1 Week To 1 Month", route: "from_7d_to_1m" },
  {
    key: "from1mTo3m",
    name: "From 1 Month To 3 Months",
    route: "from_1m_to_3m",
  },
  {
    key: "from3mTo6m",
    name: "From 3 Months To 6 Months",
    route: "from_3m_to_6m",
  },
  {
    key: "from6mTo1y",
    name: "From 6 Months To 1 Year",
    route: "from_6m_to_1y",
  },
  { key: "from1yTo2y", name: "From 1 Year To 2 Years", route: "from_1y_to_2y" },
  {
    key: "from2yTo3y",
    name: "From 2 Years To 3 Years",
    route: "from_2y_to_3y",
  },
  {
    key: "from3yTo5y",
    name: "From 3 Years To 5 Years",
    route: "from_3y_to_5y",
  },
  {
    key: "from5yTo7y",
    name: "From 5 Years To 7 Years",
    route: "from_5y_to_7y",
  },
  {
    key: "from7yTo10y",
    name: "From 7 Years To 10 Years",
    route: "from_7y_to_10y",
  },
  {
    key: "from10yToEnd",
    name: "From 10 Years To End",
    route: "from_10y_to_end",
  },
] as const;

export const yearCohorts = [
  { key: "2009", name: "2009", route: "2009" },
  { key: "2010", name: "2010", route: "2010" },
  { key: "2011", name: "2011", route: "2011" },
  { key: "2012", name: "2012", route: "2012" },
  { key: "2013", name: "2013", route: "2013" },
  { key: "2014", name: "2014", route: "2014" },
  { key: "2015", name: "2015", route: "2015" },
  { key: "2016", name: "2016", route: "2016" },
  { key: "2017", name: "2017", route: "2017" },
  { key: "2018", name: "2018", route: "2018" },
  { key: "2019", name: "2019", route: "2019" },
  { key: "2020", name: "2020", route: "2020" },
  { key: "2021", name: "2021", route: "2021" },
  { key: "2022", name: "2022", route: "2022" },
  { key: "2023", name: "2023", route: "2023" },
  { key: "2024", name: "2024", route: "2024" },
] as const;

export const ageCohorts = [
  {
    key: "",
    name: "",
    route: "",
  },
  ...xthCohorts,
  ...upToCohorts,
  ...fromXToYCohorts,
  ...yearCohorts,
] as const;
