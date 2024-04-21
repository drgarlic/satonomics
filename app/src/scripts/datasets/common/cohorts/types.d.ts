type AnyCohortDatasetKey =
  (typeof import("./index").anyCohortDatasets)[number]["key"];

type AgeCohortKey = (typeof import("./index").ageCohorts)[number]["key"];

type AgeCohortDatasetKey = AnyCohortDatasetKey;

type AddressOnlyCohortAttributeKey =
  (typeof import("./index").addressOnlyDatasets)[number]["key"];

type AddressCohortDatasetKey =
  | AnyCohortDatasetKey
  | AddressOnlyCohortAttributeKey;

type AnyCohortName = AgeCohortKey | AddressCohortKey;

type AnyPossibleCohortKey = AnyCohortName | AddressCohortKeySplitByLiquidity;

type AddressCohortName =
  (typeof import("./index").addressCohorts)[number]["name"];

type AddressCohortKey =
  (typeof import("./index").addressCohorts)[number]["key"];

type LiquidityKey = (typeof import("./index").liquidities)[number]["key"];

type AddressCohortKeySplitByLiquidity = `${AddressCohortKey}${LiquidityKey}`;

type LazyCohortDataset =
  | `PricePaidMean`
  | `RealizedPrice`
  | `RealizedCapitalization30dChange`
  | `UnrealizedLossNegative`
  | `NetUnrealizedProfitAndLoss`
  | `RelativeNetUnrealizedProfitAndLoss`
  | `RealizedLossNegative`
  | `NetRealizedProfitAndLoss`
  | `RelativeNetRealizedProfitAndLoss`
  | `CumulatedRealizedProfit`
  | `CumulatedRealizedLoss`
  | `CumulatedNetRealizedProfitAndLoss`
  | `CumulatedNetRealizedProfitAndLoss30dChange`
  | `SupplyInLoss`
  | `SupplyInLoss%Self`
  | `SupplyInLoss%All`
  | `SupplyInProfit%Self`
  | `SupplyInProfit%All`
  | `SupplyPNL%Self${MomentumKey}`
  | `SupplyTotal75Percent`
  | `SupplyTotal50Percent`
  | `SupplyTotal25Percent`
  | `SupplyTotal%All`
  | `RealizedPrice${RatioKey}`;
