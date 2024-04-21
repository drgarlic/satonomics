import { LineStyle } from "lightweight-charts";

export const createPriceLine = (series: ISeriesApi<any>) => {
  const priceLineOptions: PriceLineOptions = {
    price: 0,
    color: "transparent",
    lineVisible: true,
    lineWidth: 1,
    lineStyle: LineStyle.SparseDotted,
    axisLabelVisible: true,
    title: "",
    axisLabelColor: "",
    axisLabelTextColor: "",
  };

  return series.createPriceLine(priceLineOptions);
};
