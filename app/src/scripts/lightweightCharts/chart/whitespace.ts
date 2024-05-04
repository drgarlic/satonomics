import { createLineSeries, dateToString, ONE_DAY_IN_MS } from "/src/scripts";

export const DAY_BEFORE_GENESIS_DAY = "2009-01-02";
export const GENESIS_DAY = "2009-01-03";
// export const DAY_BEFORE_WHITEPAPER_DAY = "2008-10-30";
// export const WHITEPAPER_DAY = "2008-10-31";

export const whitespaceDataset: (WhitespaceData & Numbered)[] = [];

export function setWhitespace(chart: IChartApi, scale: ResourceScale) {
  if (scale !== "date") return;

  const whitespaceSeries = createLineSeries(chart);

  updateWhitespaceDataset(whitespaceDataset);

  whitespaceSeries.setData(whitespaceDataset.map((data) => ({ ...data })));
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
