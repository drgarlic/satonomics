type AverageName = (typeof import("./averages").averages)[number]["key"];

type TotalReturnKey = (typeof import("./averages").totalReturns)[number]["key"];

type CompoundReturnKey =
  (typeof import("./averages").compoundReturns)[number]["key"];
