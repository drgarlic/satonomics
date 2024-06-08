export const percentiles = [
  {
    key: "median_price_paid",
    name: "Median",
    title: "Median Paid",
    value: 50,
  },
  {
    key: "95p_price_paid",
    name: `95%`,
    title: `95th Percentile Paid`,
    value: 95,
  },
  {
    key: "90p_price_paid",
    name: `90%`,
    title: `90th Percentile Paid`,
    value: 90,
  },
  {
    key: "85p_price_paid",
    name: `85%`,
    title: `85th Percentile Paid`,
    value: 85,
  },
  {
    key: "80p_price_paid",
    name: `80%`,
    title: `80th Percentile Paid`,
    value: 80,
  },
  {
    key: "75p_price_paid",
    name: `75%`,
    title: `75th Percentile Paid`,
    value: 75,
  },
  {
    key: "70p_price_paid",
    name: `70%`,
    title: `70th Percentile Paid`,
    value: 70,
  },
  {
    key: "65p_price_paid",
    name: `65%`,
    title: `65th Percentile Paid`,
    value: 65,
  },
  {
    key: "60p_price_paid",
    name: `60%`,
    title: `60th Percentile Paid`,
    value: 60,
  },
  {
    key: "55p_price_paid",
    name: `55%`,
    title: `55th Percentile Paid`,
    value: 55,
  },
  {
    key: "45p_price_paid",
    name: `45%`,
    title: `45th Percentile Paid`,
    value: 45,
  },
  {
    key: "40p_price_paid",
    name: `40%`,
    title: `40th Percentile Paid`,
    value: 40,
  },
  {
    key: "35p_price_paid",
    name: `35%`,
    title: `35th Percentile Paid`,
    value: 35,
  },
  {
    key: "30p_price_paid",
    name: `30%`,
    title: `30th Percentile Paid`,
    value: 30,
  },
  {
    key: "25p_price_paid",
    name: `25%`,
    title: `25th Percentile Paid`,
    value: 25,
  },
  {
    key: "20p_price_paid",
    name: `20%`,
    title: `20th Percentile Paid`,
    value: 20,
  },
  {
    key: "15p_price_paid",
    name: `15%`,
    title: `15th Percentile Paid`,
    value: 15,
  },
  {
    key: "10p_price_paid",
    name: `10%`,
    title: `10th Percentile Paid`,
    value: 10,
  },
  {
    key: "05p_price_paid",
    name: `5%`,
    title: `5th Percentile Paid`,
    value: 5,
  },
] as const;

export const anyCohortDatasets = [
  {
    key: "RealizedCapitalization",
    route: "realized-profit",
  },
  {
    key: "RealizedLoss",
    route: "realized-loss",
  },
  {
    key: "RealizedProfit",
    route: "realized-profit",
  },
  {
    key: "UnrealizedLoss",
    route: "unrealized-loss",
  },
  {
    key: "UnrealizedProfit",
    route: "unrealized-profit",
  },
  {
    key: "UnrealizedLoss",
    route: "unrealized-loss",
  },
  {
    key: "SupplyTotal",
    route: "supply-total",
  },
  {
    key: "SupplyInProfit",
    route: "supply-in_profit",
  },
  {
    key: "UtxoCount",
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
