import { Header, Number } from ".";
import { Line } from "./tree/components";

export function FavoritesFrame({
  presets,
  selectedFrame,
}: {
  presets: Presets;
  selectedFrame: Accessor<FrameName>;
}) {
  return (
    <div
      class="flex-1 overflow-y-auto"
      hidden={selectedFrame() !== "Favorites"}
    >
      <div class="flex max-h-full min-h-0 flex-1 flex-col gap-4 p-4">
        <Header title="Favorites">
          <Number number={() => presets.favorites().length} /> presets marked as
          favorites.
        </Header>

        <div class="-mx-4 border-t border-orange-200/10" />

        <div
          class="space-y-1 py-1"
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

        <div class="h-[90dvh] flex-none" />
      </div>
    </div>
  );
}
