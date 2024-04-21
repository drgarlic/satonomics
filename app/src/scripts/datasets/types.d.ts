type DatasetValue<T> = T & Numbered & Valued;

type Datasets = ReturnType<typeof import("./index").createDatasets>;

type DateDatasets = Datasets["date"];
type HeightDatasets = Datasets["height"];
type AnyDatasets = DateDatasets | HeightDatasets;

type ResourceScale = (typeof import("./index").scales)[index];
