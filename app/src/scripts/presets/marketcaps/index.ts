import { applyMultipleSeries, colors, SeriesType } from "/src/scripts";

export const presets: PresetFolder = {
  id: "marketcaps",
  name: "Marketcaps",
  tree: [
    {
      id: "marketcaps-all",
      icon: IconTablerCircles,
      name: "All",
      title: "All Marketcaps",
      description: "",
      applyPreset(params) {
        return applyMultipleSeries({
          scale: "date",
          ...params,
          priceScaleOptions: {
            halved: true,
          },
          list: [
            {
              id: "all",
              title: "Combined",
              color: colors.white,
              dataset: params.datasets.date.combinedMarketCapitalizations,
            },
            {
              id: "bitcoin",
              title: "Bitcoin's Market Cap.",
              color: colors.bitcoin,
              dataset: params.datasets.date.marketCapitalization,
            },
            {
              id: "scamcoins",
              title: "Scamcoins' Market Cap.",
              color: colors.ethereum,
              dataset: params.datasets.date.scamcoinsMarketCapitalization,
            },
            {
              id: "fiatcoins",
              title: "Fiatcoins' Market Cap.",
              color: colors.dollars,
              dataset: params.datasets.date.fiatcoinsMarketCapitalization,
            },
          ],
        });
      },
    },
    {
      id: "marketcap-bitcoin",
      icon: IconTablerCurrencyBitcoin,
      name: "Bitcoin",
      title: "Bitcoin Market Capitalization",
      description: "",
      applyPreset(params) {
        return applyMultipleSeries({
          scale: "date",
          ...params,
          priceScaleOptions: {
            halved: true,
          },
          list: [
            {
              id: "bitcoin",
              title: "Bitcoin's Market Cap.",
              color: colors.bitcoin,
              seriesType: SeriesType.Area,
              dataset: params.datasets.date.marketCapitalization,
            },
          ],
        });
      },
    },
    {
      id: "marketcap-scamcoins",
      icon: IconTablerPlayCard,
      name: "Scamcoins",
      title: "Scamcoins Market Capitalization",
      description: "",
      applyPreset(params) {
        return applyMultipleSeries({
          scale: "date",
          ...params,
          priceScaleOptions: {
            halved: true,
          },
          list: [
            {
              id: "scams",
              title: "Scamcoins' Market Cap.",
              color: colors.ethereum,
              seriesType: SeriesType.Area,
              dataset: params.datasets.date.scamcoinsMarketCapitalization,
            },
          ],
        });
      },
    },
    {
      id: "marketcap-fiatcoins",
      icon: IconTablerCurrencyDollar,
      name: "Fiatcoins",
      title: "Fiatcoins Market Capitalization",
      description: "",
      applyPreset(params) {
        return applyMultipleSeries({
          scale: "date",
          ...params,
          priceScaleOptions: {
            halved: true,
          },
          list: [
            {
              id: "fiat",
              title: "Fiatcoins' Market Cap.",
              color: colors.dollars,
              seriesType: SeriesType.Area,
              dataset: params.datasets.date.fiatcoinsMarketCapitalization,
            },
          ],
        });
      },
    },
    {
      id: "fiatcoins-30d-change",
      icon: IconTablerStatusChange,
      name: "Fiatcoins Market Cap. 30 Day Change",
      title: "Fiatcoins Market Capitalization 30 Day Change",
      description: "",
      applyPreset(params) {
        return applyMultipleSeries({
          scale: "date",
          ...params,
          priceScaleOptions: {
            halved: true,
          },
          list: [
            {
              id: "30d-change",
              title: "30 Day Change",
              seriesType: SeriesType.Based,
              dataset:
                params.datasets.date.fiatcoinsMarketCapitalization30dChange,
            },
          ],
        });
      },
    },
  ],
};
