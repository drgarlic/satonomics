// interface FullCandlestick extends DatedCandlestickData {
//   volume: number;
// }

interface Dated {
  date: string;
}

interface Heighted {
  height: number;
}

interface Numbered {
  number: number;
}

interface Valued {
  value: number;
}

type DatasetCandlestickData = DatasetValue<CandlestickData>;

// type DatedWhitespaceData = WhitespaceData & Dated;
// type DatedSingleValueData = SingleValueData & Dated;
// type DatedCandlestickData = CandlestickData & Dated;
// type DatedLineData = LineData & Dated;
// type DatedAreaData = AreaData & Dated;
// type DatedHistogramData = HistogramData & Dated;

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

type KeysOfValue<T, TCondition> = {
  [K in keyof T]: T[K] extends TCondition ? K : never;
}[keyof T];
