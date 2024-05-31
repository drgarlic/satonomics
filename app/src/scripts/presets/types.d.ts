interface PartialPreset {
  id: string;
  icon?: () => JSXElement;
  name: string;
  title: string;
  applyPreset: ApplyPreset;
  description: string;
}

interface Preset extends PartialPreset {
  path: FilePath;
  isFavorite: ASS<boolean>;
  visited: ASS<boolean>;
  scale: ResourceScale;
}

type FilePath = {
  id: string;
  name: string;
}[];

type ApplyPreset = (params: {
  chart: IChartApi;
  datasets: Datasets;
  liveCandle: Accessor<FullCandlestick | null>;
  preset: Preset;
  presets: Presets;
  activeResources: Accessor<Set<ResourceDataset<any, any>>>;
}) => ApplyPresetReturn;

type ApplyPresetReturn = PresetLegend;

type PresetFolder = {
  scale?: ResourceScale;
  id: string;
  name: string;
  tree: PresetTree;
};

type PresetTree = (PartialPreset | PresetFolder)[];
type PresetList = Preset[];
type FavoritePresets = Accessor<Preset[]>;

type PresetsHistory = { date: Date; preset: Preset }[];
type PresetsHistorySignal = ASS<PresetsHistory>;
type SerializedPresetsHistory = { p: string; d: number }[];

interface Presets {
  tree: PresetTree;
  list: PresetList;
  favorites: FavoritePresets;
  history: PresetsHistorySignal;

  selected: ASS<Preset>;
  openedFolders: ASS<Set<string>>;

  select(preset: Preset): void;
}

type PresetLegend = SeriesLegend[];
