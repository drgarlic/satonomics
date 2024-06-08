type AnyCohortDatasetKey =
  (typeof import("./base").anyCohortDatasets)[number]["key"];

type AgeCohortKey = (typeof import("./age").ageCohorts)[number]["key"];

type AgeCohortDatasetKey = AnyCohortDatasetKey;

type AddressOnlyCohortAttributeKey =
  (typeof import("./address").addressOnlyDatasets)[number]["key"];

type AddressCohortDatasetKey =
  | AnyCohortDatasetKey
  | AddressOnlyCohortAttributeKey;

type AnyCohortName = AgeCohortKey | AddressCohortKey;

type AnyPossibleCohortKey = AnyCohortName | AddressCohortKeySplitByLiquidity;

type AddressCohortName =
  (typeof import("./address").addressCohorts)[number]["name"];

type AddressCohortKey =
  (typeof import("./address").addressCohorts)[number]["key"];

type LiquidityKey = (typeof import("./address").liquidities)[number]["key"];

type AddressCohortKeySplitByLiquidity = `${LiquidityKey}_${AddressCohortKey}`;

// type LazyCohortDataset =
//   | `PricePaidMean`
//   | `RealizedPrice`
//   | `RealizedCapitalization30dChange`
//   | `UnrealizedLossNegative`
//   | `NetUnrealizedProfitAndLoss`
//   | `RelativeNetUnrealizedProfitAndLoss`
//   | `RealizedLossNegative`
//   | `NetRealizedProfitAndLoss`
//   | `RelativeNetRealizedProfitAndLoss`
//   | `CumulatedRealizedProfit`
//   | `CumulatedRealizedLoss`
//   | `CumulatedNetRealizedProfitAndLoss`
//   | `CumulatedNetRealizedProfitAndLoss30dChange`
//   | `SupplyInLoss`
//   | `SupplyInLoss%Self`
//   | `SupplyInLoss%All`
//   | `SupplyInProfit%Self`
//   | `SupplyInProfit%All`
//   | `SupplyPNL%Self${MomentumKey}`
//   | `SupplyTotal75Percent`
//   | `SupplyTotal50Percent`
//   | `SupplyTotal25Percent`
//   | `SupplyTotal%All`
//   | `RealizedPrice${RatioKey}`;
