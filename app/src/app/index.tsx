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
  Header,
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

        <div class="h-full border-white md:border">
          <div class="flex h-full w-full flex-col md:flex-row">
            <div
              class="flex h-full w-full flex-none flex-col md:min-w-[384px] md:max-w-[75%]"
              style={{
                ...(windowSizeIsAtLeastMedium()
                  ? {
                      width: `${Math.min(barWidth(), windowSize.width * 0.75)}px`,
                    }
                  : {}),
              }}
            >
              <div class="flex min-h-0 flex-1 flex-col border border-b-0 border-white md:border-0">
                <Header
                  needsRefresh={needRefresh[0]}
                  onClick={async () => {
                    await updateServiceWorker();

                    document.location.reload();
                  }}
                />

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
                <FavoritesFrame
                  presets={presets}
                  selectedFrame={selectedFrame}
                />
                <SearchFrame presets={presets} selectedFrame={selectedFrame} />
                <SettingsFrame
                  marquee={marquee}
                  selectedFrame={selectedFrame}
                />
              </div>

              <Selector
                selected={selectedFrame}
                setSelected={_selectedFrame.set}
              />
            </div>

            <div
              class="hidden w-1 cursor-col-resize items-center justify-center bg-white md:block"
              onMouseDown={() => resizingBar.set(true)}
              onTouchStart={() => resizingBar.set(true)}
              onDblClick={() => barWidth.set(0)}
            />

            <div class="hidden h-full w-full min-w-0 flex-1 md:flex">
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
      </div>
    </>
  );
}
