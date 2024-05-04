interface Dataset<
  Scale extends ResourceScale,
  Value extends SingleValueData | CandlestickData = SingleValueData,
> {
  scale: Scale;
  values: Accessor<DatasetValue<Value>[]>;
}

type RatioKey =
  | `Ratio`
  | `Ratio7DayMovingAverage`
  | `Ratio1YearMovingAverage`
  | `Ratio99.9Percentile`
  | `Ratio99.5Percentile`
  | `Ratio99Percentile`
  | `Ratio1Percentile`
  | `Ratio0.5Percentile`
  | `Ratio0.1Percentile`
  | `Ratio99.9Price`
  | `Ratio99.5Price`
  | `Ratio99Price`
  | `Ratio1Price`
  | `Ratio0.5Price`
  | `Ratio0.1Price`
  | `Ratio${MomentumKey}`;

type MomentumKey =
  | `Momentum`
  | `MomentumBLSHBitcoinReturns`
  | `MomentumBLSHDollarReturns`;
