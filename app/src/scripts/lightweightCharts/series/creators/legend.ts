import {
  readBooleanFromStorage,
  readBooleanURLParam,
  saveToStorage,
  writeURLParam,
} from "/src/scripts/utils";
import { createASS } from "/src/solid";

export function createSeriesLegend({
  id,
  presetId,
  title,
  color,
  series,
  defaultVisible = true,
}: {
  id: string;
  presetId: string;
  title: string;
  color: Accessor<string | string[]>;
  series: ISeriesApi<SeriesType>;
  defaultVisible?: boolean;
}) {
  const storageID = `${presetId}-${id}`;

  const visible = createASS(
    readBooleanURLParam(id) ??
      readBooleanFromStorage(storageID) ??
      defaultVisible,
  );

  createEffect(() => {
    series.applyOptions({
      visible: visible(),
    });

    const v = !visible() ? false : undefined;

    writeURLParam(id, v);
    saveToStorage(storageID, v);
  });

  return {
    id,
    title,
    series,
    color,
    hovering: createASS(false),
    visible,
  };
}
