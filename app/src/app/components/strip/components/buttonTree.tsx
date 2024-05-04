import { Button } from "./button";

export function ButtonTree({
  selected,
  setSelected,
}: {
  selected: Accessor<FrameName>;
  setSelected: Setter<FrameName>;
}) {
  return (
    <Button
      selected={() => selected() === "Tree"}
      onClick={() => {
        setSelected("Tree");
      }}
      icon={() =>
        selected() === "Tree" ? IconTablerFolderFilled : IconTablerFolder
      }
    />
  );
}
