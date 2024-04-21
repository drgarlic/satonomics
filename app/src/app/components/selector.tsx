import { env } from "/src/env";
import { classPropToString } from "/src/solid";

export function Selector({
  selected,
  setSelected,
}: {
  selected: Accessor<FrameName>;
  setSelected: Setter<FrameName>;
}) {
  return (
    <div
      class={classPropToString([
        env.standalone && "pb-8 md:pb-3",
        "flex justify-around bg-black bg-black/85 p-3 backdrop-blur",
      ])}
    >
      <Button
        name="Chart"
        selected={selected}
        setSelected={setSelected}
        icon={() =>
          selected() === "Chart"
            ? IconTablerChartAreaFilled
            : IconTablerChartLine
        }
        hideOnDesktop
      />
      <Button
        name="Tree"
        selected={selected}
        setSelected={setSelected}
        icon={() =>
          selected() === "Tree" ? IconTablerFolderFilled : IconTablerFolder
        }
      />
      <Button
        name="Favorites"
        selected={selected}
        setSelected={setSelected}
        icon={() =>
          selected() === "Favorites" ? IconTablerStarFilled : IconTablerStar
        }
      />
      <Button
        name="Search"
        selected={selected}
        setSelected={setSelected}
        icon={() =>
          selected() === "Search" ? IconTablerZoomFilled : IconTablerSearch
        }
      />
      <Button
        name="Settings"
        selected={selected}
        setSelected={setSelected}
        icon={() =>
          selected() === "Settings"
            ? IconTablerSettingsFilled
            : IconTablerSettings
        }
      />
    </div>
  );
}

function Button({
  name,
  selected,
  setSelected,
  icon,
  hideOnDesktop,
  onClick,
  classes,
}: {
  name: FrameName;
  selected: Accessor<FrameName>;
  setSelected: Setter<FrameName>;
  icon: () => ValidComponent;
  hideOnDesktop?: boolean;
  onClick?: VoidFunction;
  classes?: string;
}) {
  return (
    <button
      class={classPropToString([
        selected() !== name && "opacity-50",
        hideOnDesktop ? "md:hidden" : "",
        "select-none rounded-full p-2 hover:opacity-100 active:scale-90",
        classes,
      ])}
      onClick={() => {
        onClick?.();
        setSelected(name);
      }}
    >
      <Dynamic component={icon()} class="h-5 w-5" />
    </button>
  );
}
