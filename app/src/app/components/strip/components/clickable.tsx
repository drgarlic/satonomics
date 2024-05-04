import { classPropToString } from "/src/solid";

export function Button({
  selected,
  onClick,
  icon,
  hideOnDesktop,
  hideOnMobile,
  children,
}: {
  selected?: Accessor<boolean>;
  onClick?: VoidFunction;
  icon?: () => ValidComponent;
  hideOnDesktop?: boolean;
  hideOnMobile?: boolean;
} & ParentProps) {
  return (
    <button
      class={classPropToString([
        selected?.() ? "bg-orange-200/10" : "opacity-50 hover:bg-orange-200/10",
        hideOnDesktop ? "md:hidden" : "",
        hideOnMobile ? "hidden md:block" : "",
        "select-none rounded-lg p-3.5 hover:text-orange-400 hover:opacity-100 active:scale-90",
      ])}
      onClick={onClick}
    >
      <Show when={icon} fallback={children}>
        {(icon) => <Dynamic component={icon()()} class="size-5" />}
      </Show>
    </button>
  );
}
