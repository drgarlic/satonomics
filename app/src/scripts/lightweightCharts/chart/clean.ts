import { chartState } from "/src/scripts";

export const cleanChart = () => {
  console.log("chart: clean");

  chartState.priceLine = null;
  chartState.priceSeries = null;

  try {
    chartState.chart?.remove();
  } catch {}

  chartState.chart = null;
};
