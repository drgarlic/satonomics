export function Legend({ legend }: { legend: Accessor<PresetLegend> }) {
  return (
    <div class="flex flex-1 items-center gap-1 overflow-y-auto">
      <For each={legend()}>
        {({ color, hovering, title, visible }) => (
          <button
            onMouseEnter={() => hovering.set(true)}
            onMouseLeave={() => hovering.set(false)}
            onClick={() => visible.set((visible) => !visible)}
            class="flex flex-none items-center space-x-1.5 rounded-full py-1.5 pl-2 pr-2.5 hover:bg-orange-200/20 active:scale-[0.975]"
          >
            <span
              class="flex size-4 flex-col overflow-hidden rounded-full"
              style={{
                opacity: visible() ? 1 : 0.5,
              }}
            >
              <For
                each={
                  Array.isArray(color())
                    ? (color() as string[])
                    : [color() as string]
                }
              >
                {(color) => (
                  <span
                    class="w-full flex-1"
                    style={{
                      "background-color": color,
                    }}
                  />
                )}
              </For>
            </span>
            <span
              class="text-white decoration-white decoration-wavy decoration-[1.5px]"
              style={{
                "text-decoration-line": !visible() ? "line-through" : undefined,
                "--tw-text-opacity": visible() ? 1 : 0.5,
              }}
            >
              {title}
            </span>
          </button>
        )}
      </For>
    </div>
  );
}
