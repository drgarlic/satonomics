import { dateToString } from "../../utils/date";
import { ONE_DAY_IN_MS } from "../../utils/time";
import { createLineSeries } from "../series/creators/line";

export const DAY_BEFORE_GENESIS_DAY = "2009-01-02";
export const GENESIS_DAY = "2009-01-03";
// export const DAY_BEFORE_WHITEPAPER_DAY = "2008-10-30";
// export const WHITEPAPER_DAY = "2008-10-31";

const whitespaceDateDataset: (WhitespaceData & Numbered)[] = [];
const whitespaceHeightDataset: (WhitespaceData & Numbered)[] = new Array(
  840_000,
)
  .fill(0)
  .map(
    (_, index) =>
      ({
        time: index,
        number: index,
      }) as any,
  );

export function setWhitespace(chart: IChartApi, scale: ResourceScale) {
  const whitespaceSeries = createLineSeries(chart);

  if (scale === "date") {
    updateWhitespaceDataset(whitespaceDateDataset);

    whitespaceSeries.setData(
      whitespaceDateDataset.map((data) => ({ ...data })),
    );
  } else {
    // console.log("scale,", scale, whitespaceHeightDataset);

    whitespaceSeries.setData(
      whitespaceHeightDataset.map((data) => ({ ...data })),
    );
  }
}

function updateWhitespaceDataset(
  whitespaceDataset: (WhitespaceData & Numbered)[],
) {
  const last = whitespaceDataset.at(-1);

  let date: Date;

  if (last) {
    date = new Date(last.number * ONE_DAY_IN_MS);
  } else {
    date = new Date(DAY_BEFORE_GENESIS_DAY);
  }

  const todayValueOf = new Date().valueOf();

  const tickDate = () => date.setUTCDate(date.getUTCDate() + 1);

  tickDate();

  while (date.valueOf() <= todayValueOf) {
    const dateStr = dateToString(date);

    whitespaceDataset.push({
      number: date.valueOf() / ONE_DAY_IN_MS,
      time: dateStr,
    });

    tickDate();
  }
}
