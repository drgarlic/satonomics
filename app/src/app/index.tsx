import { DocumentEventListener } from "@solid-primitives/event-listener";
import { useWindowSize } from "@solid-primitives/resize-observer";

import {
  cleanChart,
  createDatasets,
  createPresets,
  createResources,
  renderChart,
  sleep,
} from "/src/scripts";
import { createASS } from "/src/solid";

import {
  Background,
  ChartFrame,
  FavoritesFrame,
  Head,
  INPUT_PRESET_SEARCH_ID,
  LOCAL_STORAGE_MARQUEE_KEY,
  Qrcode,
  SearchFrame,
  Selector,
  SettingsFrame,
  TreeFrame,
} from "./components";
import { registerServiceWorker } from "./scripts";

const LOCAL_STORAGE_BAR_KEY = "bar-width";

export function App() {
  const { needRefresh, updateServiceWorker } = registerServiceWorker();

  const tabFocused = createASS(true);

  const qrcode = createASS("");

  const activeResources = createASS<Set<ResourceDataset<any, any>>>(new Set(), {
    equals: false,
  });

  const datasets = createDatasets({
    setActiveResources: activeResources.set,
  });

  const legend = createASS<PresetLegend>([]);

  const windowSize = useWindowSize();

  const windowSizeIsAtLeastMedium = createMemo(() => windowSize.width >= 720);

  const barWidth = createASS(
    Number(localStorage.getItem(LOCAL_STORAGE_BAR_KEY)),
  );

  createEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_BAR_KEY, String(barWidth()));
  });

  const _selectedFrame = createASS<FrameName>("Chart");

  const selectedFrame = createMemo(() =>
    windowSizeIsAtLeastMedium() && _selectedFrame() === "Chart"
      ? "Tree"
      : _selectedFrame(),
  );

  const presets = createPresets(datasets);

  const marquee = createASS(!!localStorage.getItem(LOCAL_STORAGE_MARQUEE_KEY));

  const resizingBarStart = createASS<number | undefined>(undefined);

  const resources = createResources();

  const { liveCandle } = resources.ws;

  createEffect(() => {
    const latestClose = liveCandle.latest()?.close;
    latestClose && console.log("live:", latestClose);
  });

  createEffect(
    () => {
      if (!windowSizeIsAtLeastMedium() && presets.selected()) {
        _selectedFrame.set("Chart");
      }
    },
    {
      deffer: true,
    },
  );

  createEffect(() => {
    const preset = presets.selected();

    untrack(() =>
      renderChart({
        datasets,
        preset,
        liveCandle: liveCandle.latest,
        legendSetter: legend.set,
        presets,
        activeResources,
      }),
    );
  });

  onCleanup(cleanChart);

  return (
    <>
      <Head last={liveCandle.latest} />
      {/* <Update resources={resources.http} /> */}
      <Background marquee={marquee} focused={tabFocused} />
      <DocumentEventListener
        onVisibilitychange={() =>
          tabFocused.set(document.visibilityState === "visible")
        }
        onKeydown={async (event) => {
          switch (event.key) {
            case "Escape": {
              event.stopPropagation();
              event.preventDefault();

              _selectedFrame.set("Chart");

              break;
            }
            case "/": {
              event.stopPropagation();
              event.preventDefault();

              _selectedFrame.set("Search");

              await sleep(50);

              document.getElementById(INPUT_PRESET_SEARCH_ID)?.focus();

              break;
            }
          }
        }}
      />

      <div
        class="relative h-dvh selection:bg-orange-800"
        style={{
          "user-select": resizingBarStart() !== undefined ? "none" : undefined,
        }}
        onMouseMove={(event) => {
          const start = resizingBarStart();

          if (start !== undefined) {
            barWidth.set(event.x - start + 384);
          }
        }}
        onMouseUp={() => resizingBarStart.set(undefined)}
        onMouseLeave={() => resizingBarStart.set(undefined)}
        onTouchEnd={() => resizingBarStart.set(undefined)}
        onTouchCancel={() => resizingBarStart.set(undefined)}
      >
        <Qrcode qrcode={qrcode} />

        <div class="flex size-full flex-col p-1 md:flex-row md:p-3">
          <div class="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-orange-500/10 to-orange-950/10 md:flex-row">
            <div class="flex gap-3 border-b border-white/10 bg-black/30 p-2 backdrop-blur-sm md:flex-col md:border-b-0 md:border-r md:p-3">
              <Selector
                selected={selectedFrame}
                setSelected={_selectedFrame.set}
                needsRefresh={needRefresh[0]}
                position="top"
              />
            </div>
            <div
              class="flex h-full min-h-0 md:min-w-[384px]"
              style={{
                ...(windowSizeIsAtLeastMedium()
                  ? {
                      width: `${Math.min(barWidth(), windowSize.width * 0.75)}px`,
                    }
                  : {}),
              }}
            >
              <ChartFrame
                presets={presets}
                show={() =>
                  !windowSizeIsAtLeastMedium() && selectedFrame() === "Chart"
                }
                legend={legend}
                qrcode={qrcode}
                standalone={false}
              />
              <TreeFrame presets={presets} selectedFrame={selectedFrame} />
              <FavoritesFrame presets={presets} selectedFrame={selectedFrame} />
              <SearchFrame presets={presets} selectedFrame={selectedFrame} />
              <SettingsFrame marquee={marquee} selectedFrame={selectedFrame} />
            </div>

            <div class="flex justify-between gap-3 border-t border-white/10 bg-black/30 p-2 backdrop-blur-sm md:hidden md:flex-col md:border-b-0 md:border-l md:p-3">
              <Selector
                selected={selectedFrame}
                setSelected={_selectedFrame.set}
                needsRefresh={needRefresh[0]}
                position="bottom"
              />
            </div>
          </div>

          <div
            class="mx-[3px] my-8 hidden w-[6px] cursor-col-resize items-center justify-center rounded-full bg-orange-100 opacity-0 hover:opacity-50 md:block"
            onMouseDown={(event) =>
              resizingBarStart() === undefined &&
              // TODO: set size of bar instead
              resizingBarStart.set(event.clientX)
            }
            onTouchStart={(event) =>
              resizingBarStart() === undefined &&
              resizingBarStart.set(event.touches[0].clientX)
            }
            onDblClick={() => barWidth.set(0)}
          />

          <div class="hidden min-w-0 flex-1 md:flex">
            <ChartFrame
              standalone={true}
              presets={presets}
              show={windowSizeIsAtLeastMedium}
              legend={legend}
              qrcode={qrcode}
            />
          </div>
        </div>
      </div>
    </>
  );
}
