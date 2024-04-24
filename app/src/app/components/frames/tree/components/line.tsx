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
  classes: classes,
}: {
  id: string;
  name: string;
  onClick: VoidFunction;
  active?: Accessor<boolean>;
  depth?: number;
  path?: string;
  icon?: () => JSXElement;
  absolute?: () => JSXElement;
  classes?: () => string;
} & ParentProps) {
  const ref = createASS<HTMLButtonElement | undefined>(undefined);

  return (
    <button
      id={id}
      class={classPropToString([
        active?.()
          ? "bg-orange-500/30 backdrop-blur-sm hover:bg-orange-500/50"
          : "hover:bg-orange-500/15",
        "relative -mx-2 flex w-[calc(100%+1rem)] items-center whitespace-nowrap rounded-lg px-2 py-1 hover:backdrop-blur-sm",
        classes?.(),
      ])}
      ref={ref.set}
      onClick={() => {
        onClick();
        scrollIntoView(ref(), "nearest", "instant");
      }}
      title={name}
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
      <span class="inline-flex w-full flex-col -space-y-1 truncate text-left">
        <Show when={path}>
          <span
            class="truncate text-xs text-white text-opacity-50"
            innerHTML={path}
          />
        </Show>
        <span innerHTML={name} class="truncate" />
      </span>
      <Show when={absolute}>
        {(absolute) => (
          <span class="ml-0.5 flex items-center">{absolute()()}</span>
        )}
      </Show>
    </button>
  );
}
