import { scrollIntoView } from "/src/scripts";
import { classPropToString } from "/src/solid/classes";
import {  createRWS } from "/src/solid/rws";

export function Line({
  id,
  name,
  icon,
  active,
  depth = 0,
  onClick,
  header,
  tail,
  classes: classes,
}: {
  id: string;
  name: string;
  onClick: VoidFunction;
  active?: Accessor<boolean>;
  depth?: number;
  header?: string;
  icon?: () => JSXElement;
  tail?: () => JSXElement;
  classes?: () => string;
} & ParentProps) {
  const ref = createRWS<HTMLButtonElement | undefined>(undefined);

  return (
    <button
      id={id}
      class={classPropToString([
        active?.()
          ? "bg-orange-500/30 backdrop-blur-sm hover:bg-orange-500/50"
          : "hover:bg-orange-500/15",
        "relative -mx-2 flex w-[calc(100%+1rem)] items-center whitespace-nowrap rounded-lg px-2 hover:backdrop-blur-sm",
        classes?.(),
      ])}
      ref={ref.set}
      onClick={() => {
        onClick();
        scrollIntoView(ref(), "nearest", "instant");
      }}
      title={name}
    >
      <For each={new Array(depth)}>
        {() => (
          <span class="ml-1 h-8 w-3 flex-none border-l border-orange-200/10" />
        )}
      </For>
      <Show when={icon}>
        {(icon) => (
          <span
            class="-my-0.5 mr-1"
            // style={{
            //   "margin-left": `${depth}rem`,
            // }}
          >
            {icon()()}
          </span>
        )}
      </Show>
      <span
        class={classPropToString([
          !icon && "px-1",
          "inline-flex w-full flex-col -space-y-1 truncate py-1 text-left",
        ])}
      >
        <Show when={header}>
          <span
            class="truncate text-xs text-white text-opacity-50"
            innerHTML={header}
          />
        </Show>
        <span innerHTML={name} class="truncate" />
      </span>
      <Show when={tail}>
        {(absolute) => (
          <span class="ml-0.5 flex items-center">{absolute()()}</span>
        )}
      </Show>
    </button>
  );
}
