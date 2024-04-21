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
  const sortedSources = createMemo(() =>
    [...presets.sources()].sort(([a], [b]) => a.localeCompare(b)),
  );

  return (
    <div
      class="flex h-full min-h-0 w-full flex-1 flex-col border-b border-white bg-black/95 md:border-none"
      style={{
        display: show() ? undefined : "none",
      }}
    >
      <div class="flex border-b border-dashed border-white backdrop-blur">
        <Title presets={presets} qrcode={qrcode} />
      </div>
      <div class="flex border-b border-white backdrop-blur">
        <Legend legend={legend} />
        <div class="border-l border-dashed border-white" />
        <Actions presets={presets} />
      </div>
      <Show when={show()}>
        <div class="min-h-0 flex-1">
          <Chart visible={() => !!datasets.date.price.values()?.length} />
        </div>
      </Show>

      <TimeScale />

      <div class="flex items-center space-x-3 border-t border-white bg-black px-3 backdrop-blur">
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
        <div class="h-full flex-none border-l border-dashed border-white" />
        <Network
          live={liveCandle.live}
          // resources={resources.http}
        />
      </div>
    </div>
  );
}
