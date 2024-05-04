import {
  createChart as createClassicChart,
  createChartEx as createCustomChart,
  CrosshairMode,
} from "lightweight-charts";

import { chartState, cleanChart, colors, priceToUSLocale } from "/src/scripts";

export const createChart = (scale: ResourceScale) => {
  cleanChart();

  console.log("chart: create");

  const { white } = colors;

  const options: DeepPartialChartOptions = {
    autoSize: true,
    layout: {
      fontFamily: window
        .getComputedStyle(document.body)
        .getPropertyValue("font-family"),
      background: { color: "transparent" },
      fontSize: 14,
      textColor: white,
    },
    grid: {
      vertLines: { visible: false },
      horzLines: { visible: false },
    },
    leftPriceScale: {
      // borderColor: white,
    },
    rightPriceScale: {
      // borderColor: white,
    },
    timeScale: {
      minBarSpacing: scale === "date" ? 0.05 : 0.005,
      shiftVisibleRangeOnNewBar: true,
      // borderColor:
      // borderColor: white,
    },
    crosshair: {
      mode: CrosshairMode.Normal,
      horzLine: {
        color: white,
        labelBackgroundColor: white,
      },
      vertLine: {
        color: white,
        labelBackgroundColor: white,
      },
    },
    localization: {
      priceFormatter: priceToUSLocale,
      locale: "en-us",
    },
  };

  if (scale === "date") {
    chartState.chart = createClassicChart("chart", options);
  } else {
    const horzItemBehavior = new HorzScaleBehaviorPrice();

    chartState.chart = createCustomChart("chart", horzItemBehavior, options);
  }
};

// https://github.com/tradingview/lightweight-charts/blob/master/tests/e2e/graphics/test-cases/horizontal-price-scale.js
// @ts-ignore
class HorzScaleBehaviorPrice {
  options() {}
  setOptions() {}
  preprocessData() {}
  updateFormatter() {}
  createConverterToInternalObj() {
    return (price) => price;
  }

  key(item) {
    return item;
  }

  cacheKey(item) {
    return item;
  }

  convertHorzItemToInternal(item) {
    return item;
  }

  formatHorzItem(item) {
    return item;
  }

  formatTickmark(tickMark) {
    return tickMark.time.toLocaleString("en-us");
  }

  maxTickMarkWeight(tickMarks) {
    return tickMarks.reduce(markWithGreaterWeight, tickMarks[0]).weight;
  }

  fillWeightsForPoints(sortedTimePoints, startIndex) {
    for (let index = startIndex; index < sortedTimePoints.length; ++index) {
      sortedTimePoints[index].timeWeight = computeWeight(
        sortedTimePoints[index].time,
      );
    }
  }
}

function markWithGreaterWeight(a, b) {
  return a.weight > b.weight ? a : b;
}

function computeWeight(value: number) {
  // if (value === Math.ceil(value / 1000000) * 1000000) {
  //   return 12;
  // }
  if (value === Math.ceil(value / 100000) * 100000) {
    return 11;
  }
  if (value === Math.ceil(value / 10000) * 10000) {
    return 10;
  }
  if (value === Math.ceil(value / 1000) * 1000) {
    return 9;
  }
  if (value === Math.ceil(value / 100) * 100) {
    return 8;
  }
  if (value === Math.ceil(value / 50) * 50) {
    return 7;
  }
  if (value === Math.ceil(value / 25) * 25) {
    return 6;
  }
  if (value === Math.ceil(value / 10) * 10) {
    return 5;
  }
  if (value === Math.ceil(value / 5) * 5) {
    return 4;
  }
  if (value === Math.ceil(value)) {
    return 3;
  }
  if (value * 2 === Math.ceil(value * 2)) {
    return 1;
  }

  return 0;
}
