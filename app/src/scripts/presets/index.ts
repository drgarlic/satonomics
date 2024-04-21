import { colors, random, replaceHistory, resetURLParams } from "/src/scripts";
import { createASS } from "/src/solid";

import { createPresets as createAddressesPresets } from "./addresses";
import { createPresets as createAveragesPresets } from "./averages";
import { createPresets as createBlocksPresets } from "./blocks";
import { createPresets as createCoinblocksPresets } from "./coinblocks";
import { presets as fiatPresets } from "./fiat";
import { createPresets as createHodlersPresets } from "./hodlers";
import { presets as marketcapsPresets } from "./marketcaps";
import { presets as metalsPresets } from "./metals";
import { createPresets as createMinersPresets } from "./miners";
import { createCohortPresetList } from "./templates";
import { createPresets as createTransactionsPresets } from "./transactions";
import { createPresets as createUSDPresets } from "./usd";

export * from "./templates";

export const LOCAL_STORAGE_FAVORITES_KEY = "favorites";
export const LOCAL_STORAGE_VISITED_KEY = "visited";
export const LOCAL_STORAGE_SELECTED_KEY = "preset";
export const LOCAL_STORAGE_FOLDERS_KEY = "folders";

export function createPresets(datasets: Datasets): Presets {
  const tree: PresetTree = [
    {
      scale: "date",
      id: "date",
      name: "Date",
      tree: [
        createUSDPresets("date"),
        createBlocksPresets("date"),
        createMinersPresets("date"),
        createTransactionsPresets("date"),
        ...createCohortPresetList({
          datasets,
          scale: "date",
          id: "all",
          color: colors.bitcoin,
          datasetKey: "",
          title: "",
        }),
        createAveragesPresets(datasets),
        createHodlersPresets({ scale: "date", datasets }),
        createAddressesPresets({ scale: "date", datasets }),
        createCoinblocksPresets({ scale: "date", datasets }),
        marketcapsPresets,
        fiatPresets,
        metalsPresets,
      ],
    },
    {
      scale: "height",
      id: "height",
      name: "Height",
      tree: [
        createUSDPresets("height"),
        createBlocksPresets("height"),
        createMinersPresets("height"),
        createTransactionsPresets("height"),
        ...createCohortPresetList({
          datasets,
          scale: "height",
          id: "all",
          color: colors.bitcoin,
          datasetKey: "",
          title: "",
        }),
        createHodlersPresets({ scale: "height", datasets }),
        createAddressesPresets({ scale: "height", datasets }),
        createCoinblocksPresets({ scale: "height", datasets }),
      ],
    },
  ];

  const { list, ids } = flatten(tree);

  checkIfDuplicateIds(ids);

  setIsFavorites(list);

  setVisited(list);

  const favorites = createMemo(() =>
    list.filter((preset) => preset.isFavorite()),
  );

  createEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_FAVORITES_KEY,
      JSON.stringify(favorites().map((p) => p.id)),
    );
  });

  const visited = createMemo(() => list.filter((preset) => preset.visited()));

  createEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_VISITED_KEY,
      JSON.stringify(visited().map((p) => p.id)),
    );
  });

  const history: PresetsHistory = {
    undo: createASS([], { equals: false }),
    redo: createASS([], { equals: false }),
  };

  const selected = createASS(findInitialPreset(list), {
    equals: false,
  });

  createEffect((previousPreset: Preset) => {
    if (previousPreset && previousPreset !== selected()) {
      resetURLParams();
    }
    return selected();
  }, selected());

  createEffect(() => selected().visited.set(true));

  const select = (preset: Preset) => {
    history.undo.set((l) => {
      l.push(selected());
      return l;
    });

    history.redo.set([]);

    _select(preset, selected.set);
  };

  const openedFolders = createASS(
    new Set(
      JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_FOLDERS_KEY) || "[]",
      ) as string[],
    ),
    {
      equals: false,
    },
  );

  createEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_FOLDERS_KEY,
      JSON.stringify(Array.from(openedFolders())),
    );
  });

  const sourcesList = createASS<Accessor<Sources>[]>([], { equals: false });

  const sources = createMemo(() => {
    const map = new Map<string, Source>();

    sourcesList().forEach((sources) => {
      sources().forEach((value, key) => {
        map.set(key, value);
      });
    });

    return map;
  });

  return {
    tree,
    list,
    selected,
    favorites,
    sources,
    undoPossible: createMemo(() => !!history.undo().length),
    redoPossible: createMemo(() => !!history.redo().length),
    select,
    setSources(_sourcesList) {
      sourcesList.set(_sourcesList);
    },
    selectRandom() {
      const preset = random(list);

      if (preset) {
        select(preset);
      }
    },
    openedFolders,
    undo() {
      let preset: Preset | undefined;

      history.undo.set((l) => {
        preset = l.pop();
        return l;
      });

      if (preset) {
        history.redo.set((l) => {
          l.push(selected());
          return l;
        });

        const _preset = list.find((_preset) => preset === _preset);

        if (_preset) {
          _select(_preset, selected.set);
        }
      }
    },
    redo() {
      let preset: Preset | undefined;

      history.redo.set((l) => {
        preset = l.pop();
        return l;
      });

      if (preset) {
        history.undo.set((l) => {
          l.push(selected());
          return l;
        });

        const _preset = list.find((_preset) => preset === _preset);

        if (_preset) {
          _select(_preset, selected.set);
        }
      }
    },
  };
}

function _select(preset: Preset, set: Setter<Preset>) {
  const key = LOCAL_STORAGE_SELECTED_KEY;
  const value = preset.id;

  localStorage.setItem(key, value);

  replaceHistory({ pathname: `/${value}` });

  set(preset);
}

function flatten(ref: PresetTree) {
  const result: { list: PresetList; ids: string[] } = { list: [], ids: [] };

  const _flatten = (
    ref: PresetTree,
    path?: FilePath,
    scale?: ResourceScale,
  ) => {
    ref.forEach((anyPreset) => {
      if ("tree" in anyPreset) {
        result.ids.push(anyPreset.id);

        return _flatten(
          anyPreset.tree,
          [
            ...(path || []),
            {
              name: anyPreset.name,
              id: anyPreset.id,
            },
          ],
          anyPreset.scale || scale,
        );
      } else {
        const preset = anyPreset as Partial<Preset>;
        preset.path = path || [];
        preset.isFavorite = createASS(false);
        preset.visited = createASS(false);
        preset.scale = scale;

        if (!preset.id) {
          throw Error("Preset MUST have an ID");
        }

        if (!preset.scale) {
          throw Error("Preset MUST have a scale");
        }

        result.list.push(preset as Preset);
        result.ids.push(preset.id);
      }
    });
  };

  _flatten(ref);

  return result;
}

function checkIfDuplicateIds(ids: string[]) {
  if (ids.length !== new Set(ids).size) {
    const m = new Map<string, number>();

    ids.forEach((id) => {
      m.set(id, (m.get(id) || 0) + 1);
    });

    console.log(
      [...m.entries()].filter(([_, value]) => value > 1).map(([key, _]) => key),
    );

    throw Error("ID duplicate");
  }
}

function findInitialPreset(presets: PresetList): Preset {
  const params = useParams();

  return (
    presets.find((preset) => preset.id === params.preset) ||
    presets.find(
      (preset) =>
        preset.id === localStorage.getItem(LOCAL_STORAGE_SELECTED_KEY),
    ) ||
    presets[0]
  );
}

function setIsFavorites(list: PresetList) {
  (
    JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_FAVORITES_KEY) || "[]",
    ) as string[]
  ).forEach((id) => {
    list.find((preset) => preset.id === id)?.isFavorite.set(true);
  });
}

function setVisited(list: PresetList) {
  (
    JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_VISITED_KEY) || "[]",
    ) as string[]
  ).forEach((id) => {
    list.find((preset) => preset.id === id)?.visited.set(true);
  });
}
