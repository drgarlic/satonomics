interface ResourceDataset<
  Scale extends ResourceScale,
  Type extends OHLC | number = number,
  FetchedDataset extends
    | FetchedDateDataset<Type>
    | FetchedHeightDataset<Type> = Scale extends "date"
    ? FetchedDateDataset<Type>
    : FetchedHeightDataset<Type>,
  Value extends SingleValueData | CandlestickData = Type extends number
    ? SingleValueData
    : CandlestickData,
  // Scale extends ResourceScale,
  // T extends SingleValueData = SingleValueData,
  // Fetched = Scale extends "date" ? FetchedDateDataset : FetchedHeightDataset,
  // Value = DatasetValue<T>,
> extends Dataset<Scale, Value> {
  url: string;
  fetch: (id: number) => void;
  fetchedJSONs: FetchedResult<Scale, Type>[];
  drop: VoidFunction;
}

// type ResourceDatasets = ReturnType<
//   typeof import("./index").createResourceDatasets
// >;

// type DateResourceDatasets = ResourceDatasets["date"];
// type HeightResourceDatasets = ResourceDatasets["height"];
// type AnyResourceDatasets = DateResourceDatasets | HeightResourceDatasets;

interface FetchedResult<
  Scale extends ResourceScale,
  Type extends number | OHLC,
  Dataset extends
    | FetchedDateDataset<Type>
    | FetchedHeightDataset<Type> = Scale extends "date"
    ? FetchedDateDataset<Type>
    : FetchedHeightDataset<Type>,
  Value extends DatasetValue<SingleValueData | CandlestickData> = DatasetValue<
    Type extends number ? SingleValueData : CandlestickData
  >,
> {
  at: Date | null;
  loading: RWS<boolean>;
  json: RWS<FetchedJSON<Scale, Type, Dataset> | null>;
  vec: Accessor<Value[] | null>;
}

interface FetchedJSON<
  Scale extends ResourceScale,
  Type extends number | OHLC,
  Dataset extends
    | FetchedDateDataset<Type>
    | FetchedHeightDataset<Type> = Scale extends "date"
    ? FetchedDateDataset<Type>
    : FetchedHeightDataset<Type>,
> {
  source: FetchedSource;
  chunk: FetchedChunk;
  dataset: FetchedDataset<Scale, Type, Dataset>;
}

type FetchedSource = string;

interface FetchedChunk {
  id: number;
  previous: string | null;
  next: string | null;
}

interface FetchedDataset<
  Scale extends ResourceScale,
  Type extends number | OHLC,
  Dataset extends
    | FetchedDateDataset<Type>
    | FetchedHeightDataset<Type> = Scale extends "date"
    ? FetchedDateDataset<Type>
    : FetchedHeightDataset<Type>,
> {
  version: number;
  map: Dataset;
}

type FetchedDateDataset<T> = Record<string, T>;
type FetchedHeightDataset<T> = T[];

interface OHLC {
  open: number;
  high: number;
  low: number;
  close: number;
}
