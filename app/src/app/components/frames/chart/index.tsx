import { Box } from "../box";
import { Chart, Network, Title } from "./components";
import { Actions } from "./components/actions";
import { Legend } from "./components/legend";
import { TimeScale } from "./components/timeScale";

export function ChartFrame({
  presets,
  resources,
  liveCandle,
  show,
  legend,
  datasets,
  qrcode,
}: {
  presets: Presets;
  resources: Resources;
  liveCandle: ResourceWS<DatasetCandlestickData>;
  show: Accessor<boolean>;
  legend: Accessor<PresetLegend>;
  datasets: Datasets;
  qrcode: ASS<string>;
}) {
  // const sortedSources = createMemo(() =>
  //   [...presets.sources()].sort(([a], [b]) => a.localeCompare(b)),
  // );

  return (
    <div
      class="flex size-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-orange-200/15 bg-gradient-to-b from-orange-100/5 to-black/10 to-80%"
      style={{
        display: show() ? undefined : "none",
      }}
    >
      {/* <div class="m-2 space-y-1 rounded-xl border border-orange-200/15 bg-orange-100/5 p-2 backdrop-blur-sm"> */}
      <Box flex={false} dark>
        <Title presets={presets} qrcode={qrcode} />

        <div class="-mx-2 border-t border-orange-200/15" />

        <div class="flex pt-1.5">
          <Legend legend={legend} />

          <div class="-my-1.5 border-l border-orange-200/15 pr-1.5" />

          <Actions presets={presets} />
        </div>
      </Box>
      {/* </div> */}

      <Show when={show()}>
        <div class="min-h-0 flex-1">
          <Chart visible={() => !!datasets.date.price.values()?.length} />
        </div>
      </Show>

      <div class="-mt-8 border-t border-orange-200/10 bg-orange-200/5 pt-8">
        <TimeScale />
      </div>

      {/* <div class="flex items-center space-x-3 bg-black p-3 backdrop-blur">
        <div class="flex flex-1 items-center space-x-1 overflow-y-auto py-1">
          <div>Sources:</div>
          <For each={sortedSources()}>
            {([name, source]) => (
              <a
                style={{
                  "background-color": source.color,
                }}
                href={source.url}
                target="_blank"
                class="rounded-full px-1.5 py-0.5 text-xs font-bold text-black hover:underline"
              >
                {name}
              </a>
            )}
          </For>
        </div>
        <Network live={liveCandle.live} />
      </div> */}
    </div>
  );
}
