import { Button } from "./button";

export function ButtonFavorites({
  selected,
  setSelected,
}: {
  selected: Accessor<FrameName>;
  setSelected: Setter<FrameName>;
}) {
  return (
    <Button
      selected={() => selected() === "Favorites"}
      onClick={() => {
        setSelected("Favorites");
      }}
      icon={() =>
        selected() === "Favorites" ? IconTablerStarFilled : IconTablerStar
      }
    />
  );
}
