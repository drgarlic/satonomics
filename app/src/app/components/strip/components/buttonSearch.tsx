import { Button } from "./button";

export function ButtonSearch({
  selected,
  setSelected,
}: {
  selected: Accessor<FrameName>;
  setSelected: Setter<FrameName>;
}) {
  return (
    <Button
      selected={() => selected() === "Search"}
      onClick={() => {
        setSelected("Search");
      }}
      icon={() =>
        selected() === "Search" ? IconTablerZoomFilled : IconTablerSearch
      }
    />
  );
}
