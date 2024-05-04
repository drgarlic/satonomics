import { Button } from "./button";

export function ButtonHistory({
  selected,
  setSelected,
}: {
  selected: Accessor<FrameName>;
  setSelected: Setter<FrameName>;
}) {
  return (
    <Button
      selected={() => selected() === "History"}
      onClick={() => {
        setSelected("History");
      }}
      icon={() => IconTablerHistory}
    />
  );
}
