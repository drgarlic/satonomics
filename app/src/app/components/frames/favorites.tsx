import { Counter } from "./counter";
import { ScrollableFrame } from "./scrollable";
import { Line } from "./tree/components";

export function FavoritesFrame({
  presets,
  selectedFrame,
}: {
  presets: Presets;
  selectedFrame: Accessor<FrameName>;
}) {
  return (
    <ScrollableFrame hidden={() => selectedFrame() !== "Favorites"}>
      <Counter count={() => presets.favorites().length} name="favorites" />
      <div
        class="py-1"
        style={{
          display: !presets.favorites().length ? "none" : undefined,
        }}
      >
        <For each={presets.favorites()}>
          {(preset) => (
            <Line
              id={`favorite-${preset.id}`}
              name={preset.title}
              onClick={() => presets.select(preset)}
              active={() => presets.selected() === preset}
              path={`/ ${[...preset.path.map(({ name }) => name), preset.name].join(" / ")}`}
            />
          )}
        </For>
      </div>
    </ScrollableFrame>
  );
}
