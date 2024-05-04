import { Button } from "./button";

export function ButtonChart({
  selected,
  setSelected,
}: {
  selected: Accessor<FrameName>;
  setSelected: Setter<FrameName>;
}) {
  return (
    <Button
      selected={() => selected() === "Chart"}
      onClick={() => {
        setSelected("Chart");
      }}
      icon={() =>
        selected() === "Chart" ? IconTablerChartAreaFilled : IconTablerChartLine
      }
      hideOnDesktop
    />
  );
}
