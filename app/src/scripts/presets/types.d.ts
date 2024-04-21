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

interface PresetsHistory {
  undo: ASS<Preset[]>;
  redo: ASS<Preset[]>;
}

interface Presets {
  tree: PresetTree;
  list: PresetList;
  favorites: FavoritePresets;

  selected: ASS<Preset>;
  openedFolders: ASS<Set<string>>;

  sources: Accessor<Sources>;
  undoPossible: Accessor<boolean>;
  redoPossible: Accessor<boolean>;

  setSources(sourcesList: Accessor<Sources>[]);
  select(preset: Preset): void;
  selectRandom: VoidFunction;
  undo: VoidFunction;
  redo: VoidFunction;
}

type Sources = Map<string, Source>;

type PresetLegend = SeriesLegend[];
