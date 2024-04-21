export const percentiles = [
  {
    key: "PricePaidMedian" as const,
    route: "price_paid-median" as const,
    value: 50 as const,
    name: "Median" as const,
    title: "Median Paid" as const,
  },
  {
    key: "PricePaid95Percentile" as const,
    route: "price_paid-95p" as const,
    value: 95 as const,
    name: `95%` as const,
    title: `95th Percentile Paid` as const,
  },
  {
    key: "PricePaid90Percentile" as const,
    route: "price_paid-90p",
    value: 90 as const,
    name: `90%` as const,
    title: `90th Percentile Paid` as const,
  },
  {
    key: "PricePaid85Percentile" as const,
    route: "price_paid-85p",
    value: 85 as const,
    name: `85%` as const,
    title: `85th Percentile Paid` as const,
  },
  {
    key: "PricePaid80Percentile" as const,
    route: "price_paid-80p",
    value: 80 as const,
    name: `80%` as const,
    title: `80th Percentile Paid` as const,
  },
  {
    key: "PricePaid75Percentile" as const,
    route: "price_paid-75p",
    value: 75 as const,
    name: `75%` as const,
    title: `75th Percentile Paid` as const,
  },
  {
    key: "PricePaid70Percentile" as const,
    route: "price_paid-70p",
    value: 70 as const,
    name: `70%` as const,
    title: `70th Percentile Paid` as const,
  },
  {
    key: "PricePaid65Percentile" as const,
    route: "price_paid-65p",
    value: 65 as const,
    name: `65%` as const,
    title: `65th Percentile Paid` as const,
  },
  {
    key: "PricePaid60Percentile" as const,
    route: "price_paid-60p",
    value: 60 as const,
    name: `60%` as const,
    title: `60th Percentile Paid` as const,
  },
  {
    key: "PricePaid55Percentile" as const,
    route: "price_paid-55p",
    value: 55 as const,
    name: `55%` as const,
    title: `55th Percentile Paid` as const,
  },
  {
    key: "PricePaid45Percentile" as const,
    route: "price_paid-45p",
    value: 45 as const,
    name: `45%` as const,
    title: `45th Percentile Paid` as const,
  },
  {
    key: "PricePaid40Percentile" as const,
    route: "price_paid-40p",
    value: 40 as const,
    name: `40%` as const,
    title: `40th Percentile Paid` as const,
  },
  {
    key: "PricePaid35Percentile" as const,
    route: "price_paid-35p",
    value: 35 as const,
    name: `35%` as const,
    title: `35th Percentile Paid` as const,
  },
  {
    key: "PricePaid30Percentile" as const,
    route: "price_paid-30p",
    value: 30 as const,
    name: `30%` as const,
    title: `30th Percentile Paid` as const,
  },
  {
    key: "PricePaid25Percentile" as const,
    route: "price_paid-25p",
    value: 25 as const,
    name: `25%` as const,
    title: `25th Percentile Paid` as const,
  },
  {
    key: "PricePaid20Percentile" as const,
    route: "price_paid-20p",
    value: 20 as const,
    name: `20%` as const,
    title: `20th Percentile Paid` as const,
  },
  {
    key: "PricePaid15Percentile" as const,
    route: "price_paid-15p",
    value: 15 as const,
    name: `15%` as const,
    title: `15th Percentile Paid` as const,
  },
  {
    key: "PricePaid10Percentile" as const,
    route: "price_paid-10p",
    value: 10 as const,
    name: `10%` as const,
    title: `10th Percentile Paid` as const,
  },
  {
    key: "PricePaid05Percentile" as const,
    route: "price_paid-05p",
    value: 5 as const,
    name: `5%` as const,
    title: `5th Percentile Paid` as const,
  },
] as const;

export const anyCohortDatasets = [
  {
    key: "RealizedCapitalization" as const,
    route: "realized-capitalization",
  },
  {
    key: "RealizedLoss" as const,
    route: "realized-loss",
  },
  {
    key: "RealizedProfit" as const,
    route: "realized-profit",
  },
  {
    key: "UnrealizedLoss" as const,
    route: "unrealized-loss",
  },
  {
    key: "UnrealizedProfit" as const,
    route: "unrealized-profit",
  },
  {
    key: "UnrealizedLoss" as const,
    route: "unrealized-loss",
  },
  {
    key: "SupplyTotal" as const,
    route: "supply-total",
  },
  {
    key: "SupplyInProfit" as const,
    route: "supply-in_profit",
  },
  {
    key: "UtxoCount" as const,
    route: "utxo_count",
  },
  ...percentiles,
] as const;

// export const allCohortKeys = [...ageCohortsKeys, ...addressCohortsKeys];

// export const allPossibleCohortKeys: AnyPossibleCohortKey[] = [
//   ...ageCohortsKeys,
//   ...addressCohortsKeys,
//   ...addressCohortsKeys.flatMap((name) =>
//     liquidities.map(
//       ({ key: liquidity }): AddressCohortKeySplitByLiquidity =>
//         `${name}${liquidity}`,
//     ),
//   ),
// ];
