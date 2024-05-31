import { run } from "/src/scripts";

import { Header } from "./header";
import { Line } from "./line";

export function HistoryFrame({
  presets,
  selectedFrame,
}: {
  presets: Presets;
  selectedFrame: Accessor<FrameName>;
}) {
  return (
    <div class="flex-1 overflow-y-auto" hidden={selectedFrame() !== "History"}>
      <div class="flex max-h-full min-h-0 flex-1 flex-col gap-4 p-4">
        <Header title="History">List of previously visited presets.</Header>

        <div class="-mx-4 border-t border-orange-200/10" />

        <div
          class="space-y-0.5 py-1"
          style={{
            display: !presets.history().length ? "none" : undefined,
          }}
        >
          <For each={presets.history()}>
            {({ preset, date }, index) => (
              <>
                <Show
                  when={
                    index() === 0 ||
                    presets
                      .history()
                      [index() - 1].date.toJSON()
                      .split("T")[0] !== new Date().toJSON().split("T")[0]
                  }
                >
                  <p>
                    <Switch fallback={date.toLocaleDateString()}>
                      <Match
                        when={
                          new Date().toJSON().split("T")[0] ===
                          date.toJSON().split("T")[0]
                        }
                      >
                        Today
                      </Match>
                      <Match
                        when={
                          run(() => {
                            const d = new Date();
                            d.setDate(d.getDate() - 1);
                            return d;
                          })
                            .toJSON()
                            .split("T")[0] === date.toJSON().split("T")[0]
                        }
                      >
                        Yesterday
                      </Match>
                    </Switch>
                  </p>
                </Show>
                <Line
                  id={`history-${preset.id}`}
                  name={preset.title}
                  onClick={() => presets.select(preset)}
                  active={() => presets.selected() === preset}
                  header={date.toLocaleTimeString()}
                />
              </>
            )}
          </For>
        </div>

        <div class="h-[25dvh] flex-none" />
      </div>
    </div>
  );
}
