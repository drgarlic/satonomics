import { classPropToString } from "/src/solid";

import { Box } from "../box";
import { Actions } from "./components/actions";
import { Chart } from "./components/chart";
import { Legend } from "./components/legend";
import { TimeScale } from "./components/timeScale";
import { Title } from "./components/title";

export function ChartFrame({
  presets,
  show,
  legend,
  qrcode,
  standalone,
  fullscreen,
}: {
  presets: Presets;
  show: Accessor<boolean>;
  legend: Accessor<PresetLegend>;
  qrcode: ASS<string>;
  fullscreen?: ASS<boolean>;
  standalone: boolean;
}) {
  return (
    <div
      class={classPropToString([
        standalone &&
          "rounded-2xl border border-orange-200/15 bg-gradient-to-b from-orange-100/5 to-black/10 to-80%",
        "flex size-full min-h-0 flex-1 flex-col overflow-hidden",
      ])}
      style={{
        display: show() ? undefined : "none",
      }}
    >
      <Box flex={false} dark>
        <Title presets={presets} qrcode={qrcode} />

        <div class="-mx-2 border-t border-orange-200/15" />

        <div class="flex pt-1.5">
          <Legend legend={legend} />

          <div class="-my-1.5 border-l border-orange-200/15 pr-1.5" />

          <Actions presets={presets} qrcode={qrcode} fullscreen={fullscreen} />
        </div>
      </Box>

      <Show when={show()}>
        <div class="-mt-2 min-h-0 flex-1">
          <Chart />
        </div>
      </Show>

      <TimeScale />
    </div>
  );
}
