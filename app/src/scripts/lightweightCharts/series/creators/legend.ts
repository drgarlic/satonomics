import {
  readBooleanFromStorage,
  saveToStorage,
} from "/src/scripts/utils/storage";
import {
  readBooleanURLParam,
  writeURLParam,
} from "/src/scripts/utils/urlParams";
import { createRWS } from "/src/solid/rws";

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

  console.log(readBooleanURLParam(id), readBooleanFromStorage(storageID));

  const visible = createRWS(
    readBooleanURLParam(id) ??
      readBooleanFromStorage(storageID) ??
      defaultVisible,
  );

  createEffect(() => {
    const v = visible();

    series.applyOptions({
      visible: v,
    });

    if (v !== defaultVisible) {
      writeURLParam(id, v);
      saveToStorage(storageID, v);
    } else {
      writeURLParam(id, undefined);
      saveToStorage(storageID, undefined);
    }
  });

  return {
    id,
    title,
    series,
    color,
    hovering: createRWS(false),
    visible,
  };
}
