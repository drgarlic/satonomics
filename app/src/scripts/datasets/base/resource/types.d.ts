type ResourceDatasets = ReturnType<
  typeof import("./index").createResourceDatasets
>;

type DateResourceDatasets = ResourceDatasets["date"];
type HeightResourceDatasets = ResourceDatasets["height"];
type AnyResourceDatasets = DateResourceDatasets | HeightResourceDatasets;

type FetchedDateDataset = Record<string, number>;
type FetchedHeightDataset = number[];
type FetchedPriceDataset = FetchedCandlestickData[];

interface ResourceDataset<
  Scale extends ResourceScale,
  Fetched = Scale extends "date" ? FetchedDateDataset : FetchedHeightDataset,
  T extends SingleValueData = SingleValueData,
  Value = DatasetValue<T>,
> extends Dataset<Scale, T, Value> {
  url: URL;
  fetch: VoidFunction;
  fetchedValues: Accessor<Fetched | null>;
  loading: ASS<boolean>;
  source: Accessor<Source | null>;
  drop: VoidFunction;
}

interface Source {
  name: string;
  url: string;
  color: string;
}

interface FetchedCandlestickData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
