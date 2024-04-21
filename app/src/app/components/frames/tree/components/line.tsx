import { scrollIntoView } from "/src/scripts";
import { classPropToString, createASS } from "/src/solid";

export function Line({
  id,
  name,
  icon,
  active,
  depth = 0,
  onClick,
  path,
  absolute,
}: {
  id: string;
  name: string;
  onClick: VoidFunction;
  active?: Accessor<boolean>;
  depth?: number;
  path?: string;
  icon?: () => JSXElement;
  absolute?: () => JSXElement;
} & ParentProps) {
  const ref = createASS<HTMLButtonElement | undefined>(undefined);

  return (
    <button
      id={id}
      class={classPropToString([
        active?.() ? "bg-white/20 hover:bg-white/30" : "hover:bg-white/20",
        "relative flex w-full items-center whitespace-nowrap py-1 pl-3",
      ])}
      ref={ref.set}
      onClick={() => {
        onClick();
        scrollIntoView(ref(), "nearest", "instant");
      }}
    >
      <Show when={icon}>
        {(icon) => (
          <span
            class="-my-0.5 mr-1"
            style={{
              "margin-left": `${depth}rem`,
            }}
          >
            {icon()()}
          </span>
        )}
      </Show>
      <span class="inline-flex flex-col -space-y-1 overflow-hidden text-left">
        <Show when={path}>
          <span class="text-xs text-white text-opacity-50" innerHTML={path} />
        </Show>
        <span innerHTML={name} />
      </span>
      <Show when={absolute}>
        {(absolute) => (
          <span class="absolute inset-y-0 right-0 mr-2 flex items-center">
            {absolute()()}
          </span>
        )}
      </Show>
    </button>
  );
}
