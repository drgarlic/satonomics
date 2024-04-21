import { classPropToString } from "/src/solid";

export function Actions({ presets }: { presets: Presets }) {
  return (
    <div class="flex">
      <Button
        icon={() => IconTablerArrowsShuffle2}
        onClick={presets.selectRandom}
      />
      <span class="border-r border-dashed border-white" />
      <Button
        disabled={() => !presets.undoPossible()}
        icon={() => IconTablerArrowBack}
        onClick={presets.undo}
      />
      <span class="border-r border-dashed border-white" />
      <Button
        disabled={() => !presets.redoPossible()}
        icon={() => IconTablerArrowForward}
        onClick={presets.redo}
      />
      <span class="border-r border-dashed border-white" />
      <Button
        colors={() =>
          presets.selected().isFavorite()
            ? "bg-amber-950/50 text-amber-500 hover:bg-amber-950"
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
        colors?.() || (disabled?.() ? "" : "hover:bg-white/20"),
        !disabled?.() && "group",
        "flex-none p-2.5 disabled:opacity-25",
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
