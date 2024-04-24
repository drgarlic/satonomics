import { DocumentEventListener } from "@solid-primitives/event-listener";
import { useWindowSize } from "@solid-primitives/resize-observer";

import {
  cleanChart,
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

export function App({ datasets }: { datasets: Datasets }) {
  const { needRefresh, updateServiceWorker } = registerServiceWorker();

  const tabFocused = createASS(true);

  const qrcode = createASS("");

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

  const resizingBar = createASS(false);

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

    if (datasets.date.price.values()?.length) {
      untrack(() =>
        renderChart({
          datasets,
          preset,
          liveCandle: liveCandle.latest,
          legendSetter: legend.set,
          presets,
        }),
      );
    }
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
          "user-select": resizingBar() ? "none" : undefined,
        }}
        onMouseMove={(event) => resizingBar() && barWidth.set(event.x + 1)}
        onMouseUp={() => resizingBar.set(false)}
        onMouseLeave={() => resizingBar.set(false)}
        onTouchEnd={() => resizingBar.set(false)}
        onTouchCancel={() => resizingBar.set(false)}
      >
        <Qrcode qrcode={qrcode} />

        <div class="flex size-full flex-col p-3 md:flex-row">
          <div class="flex overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-orange-500/10 to-orange-950/10">
            <div class="flex flex-col space-y-3 bg-black/30 p-3 backdrop-blur-sm">
              <Selector
                selected={selectedFrame}
                setSelected={_selectedFrame.set}
              />
            </div>
            <div class="border-l border-white/10" />
            <div
              class="flex md:min-w-[384px]"
              style={{
                ...(windowSizeIsAtLeastMedium()
                  ? {
                      width: `${Math.min(barWidth(), windowSize.width * 0.75)}px`,
                    }
                  : {}),
              }}
            >
              {/* <div class="flex min-h-0 flex-1 flex-col md:border-0"> */}
              {/* <Header
                  needsRefresh={needRefresh[0]}
                  onClick={async () => {
                    await updateServiceWorker();

                    document.location.reload();
                  }}
                /> */}

              <ChartFrame
                presets={presets}
                liveCandle={liveCandle}
                resources={resources}
                show={() =>
                  !windowSizeIsAtLeastMedium() && selectedFrame() === "Chart"
                }
                legend={legend}
                datasets={datasets}
                qrcode={qrcode}
              />
              <TreeFrame presets={presets} selectedFrame={selectedFrame} />
              <FavoritesFrame presets={presets} selectedFrame={selectedFrame} />
              <SearchFrame presets={presets} selectedFrame={selectedFrame} />
              <SettingsFrame marquee={marquee} selectedFrame={selectedFrame} />
              {/* </div> */}
            </div>
          </div>

          <div
            class="mx-1 my-8 hidden w-1 cursor-col-resize items-center justify-center rounded-full bg-orange-100 opacity-0 hover:opacity-50 md:block"
            onMouseDown={() => resizingBar.set(true)}
            onTouchStart={() => resizingBar.set(true)}
            onDblClick={() => barWidth.set(0)}
          />

          <div class="hidden min-w-0 flex-1 md:flex">
            <ChartFrame
              presets={presets}
              liveCandle={liveCandle}
              resources={resources}
              show={windowSizeIsAtLeastMedium}
              legend={legend}
              datasets={datasets}
              qrcode={qrcode}
            />
          </div>
        </div>
      </div>
    </>
  );
}
