import { classPropToString } from "/src/solid";

export function Actions({ presets }: { presets: Presets }) {
  return (
    <div class="flex">
      <Button
        icon={() => IconTablerArrowsShuffle2}
        onClick={presets.selectRandom}
      />
      <Button
        disabled={() => !presets.undoPossible()}
        icon={() => IconTablerArrowBack}
        onClick={presets.undo}
      />
      <Button
        disabled={() => !presets.redoPossible()}
        icon={() => IconTablerArrowForward}
        onClick={presets.redo}
      />
      <Button
        colors={() =>
          presets.selected().isFavorite()
            ? "text-amber-500 bg-amber-500/15 hover:bg-amber-500/30"
            : ""
        }
        icon={() =>
          presets.selected().isFavorite()
            ? IconTablerStarFilled
            : IconTablerStar
        }
        onClick={() => presets.selected().isFavorite.set((b) => !b)}
      />
    </div>
  );
}

function Button({
  icon,
  colors,
  onClick,
  disabled,
}: {
  icon: () => ValidComponent;
  colors?: () => string;
  onClick: VoidFunction;
  disabled?: () => boolean;
}) {
  return (
    <button
      disabled={disabled?.()}
      class={classPropToString([
        colors?.() || (disabled?.() ? "" : "hover:bg-orange-200/15"),
        !disabled?.() && "group",
        "flex-none rounded-lg p-2 disabled:opacity-50",
      ])}
      onClick={onClick}
    >
      <Dynamic
        component={icon()}
        class="size-[1.125rem] group-active:scale-90"
      />
    </button>
  );
}
