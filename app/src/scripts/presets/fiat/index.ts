import { PriceScaleMode } from "lightweight-charts";

import { applyMultipleSeries } from "/src/scripts";

export const presets: PresetFolder = {
  id: "fiat",
  name: "Fiat Currencies",
  tree: [
    createPresetFolder({
      id: "aed",
      icon: IconTablerCurrencyDirham,
      name: "United Arab Emirates Dirham",
      getPriceDataset: (datasets) =>
        datasets.date.priceInUnitedArabEmiratesDirham,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInUnitedArabEmiratesDirham,
    }),
    createPresetFolder({
      id: "ars",
      icon: IconTablerCurrencyDollar,
      name: "Argentine Peso",
      getPriceDataset: (datasets) => datasets.date.priceInArgentinePeso,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInArgentinePeso,
    }),
    createPresetFolder({
      id: "aud",
      icon: IconTablerCurrencyDollarAustralian,
      name: "Australian Dollar",
      getPriceDataset: (datasets) => datasets.date.priceInAustralianDollar,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInAustralianDollar,
    }),
    createPresetFolder({
      id: "bdt",
      icon: IconTablerCurrencyTaka,
      name: "Bangladeshi Taka",
      getPriceDataset: (datasets) => datasets.date.priceInBangladeshiTaka,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInBangladeshiTaka,
    }),
    createPresetFolder({
      id: "bhd",
      icon: IconTablerCurrencyBahraini,
      name: "Bahraini Dinar",
      getPriceDataset: (datasets) => datasets.date.priceInBahrainiDinar,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInBahrainiDinar,
    }),
    createPresetFolder({
      id: "bmd",
      icon: IconTablerCurrencyDollar,
      name: "Bermudian Dollar",
      getPriceDataset: (datasets) => datasets.date.priceInBermudianDollar,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInBermudianDollar,
    }),
    createPresetFolder({
      id: "brl",
      icon: IconTablerCurrencyReal,
      name: "Brazil Real",
      getPriceDataset: (datasets) => datasets.date.priceInBrazilReal,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInBrazilReal,
    }),
    createPresetFolder({
      id: "cad",
      icon: IconTablerCurrencyDollarCanadian,
      name: "Canadian Dollar",
      getPriceDataset: (datasets) => datasets.date.priceInCanadianDollar,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInCanadianDollar,
    }),
    createPresetFolder({
      id: "chf",
      icon: IconTablerCurrencyFrank,
      name: "Swiss Franc",
      getPriceDataset: (datasets) => datasets.date.priceInSwissFranc,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInSwissFranc,
    }),
    createPresetFolder({
      id: "clp",
      icon: IconTablerCurrencyPeso,
      name: "Chilean Peso",
      getPriceDataset: (datasets) => datasets.date.priceInChileanPeso,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInChileanPeso,
    }),
    createPresetFolder({
      id: "cny",
      icon: IconTablerCurrencyYuan,
      name: "Chinese Yuan",
      getPriceDataset: (datasets) => datasets.date.priceInChineseYuan,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInChineseYuan,
    }),
    createPresetFolder({
      id: "czk",
      icon: IconTablerCurrencyKroneCzech,
      name: "Czech Koruna",
      getPriceDataset: (datasets) => datasets.date.priceInCzechKoruna,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInCzechKoruna,
    }),
    createPresetFolder({
      id: "dkk",
      icon: IconTablerCurrencyKroneDanish,
      name: "Danish Krone",
      getPriceDataset: (datasets) => datasets.date.priceInDanishKrone,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInDanishKrone,
    }),
    createPresetFolder({
      id: "eur",
      icon: IconTablerCurrencyEuro,
      name: "Euro",
      getPriceDataset: (datasets) => datasets.date.priceInEuro,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInEuro,
    }),
    createPresetFolder({
      id: "gbp",
      icon: IconTablerCurrencyPound,
      name: "British Pound Sterling",
      getPriceDataset: (datasets) => datasets.date.priceInBritishPoundSterling,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInBritishPoundSterling,
    }),
    createPresetFolder({
      id: "gel",
      icon: IconTablerCurrencyLari,
      name: "Georgian Lari",
      getPriceDataset: (datasets) => datasets.date.priceInGeorgianLari,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInGeorgianLari,
    }),
    createPresetFolder({
      id: "hkd",
      icon: IconTablerCurrencyDollar,
      name: "Hong Kong Dollar",
      getPriceDataset: (datasets) => datasets.date.priceInHongKongDollar,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInHongKongDollar,
    }),
    createPresetFolder({
      id: "huf",
      icon: IconTablerCurrencyForint,
      name: "Hungarian Forint",
      getPriceDataset: (datasets) => datasets.date.priceInHungarianForint,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInHungarianForint,
    }),
    createPresetFolder({
      id: "idr",
      icon: IconTablerLetterR,
      name: "Indonesian Rupiah",
      getPriceDataset: (datasets) => datasets.date.priceInIndonesianRupiah,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInIndianRupee,
    }),
    createPresetFolder({
      id: "ils",
      icon: IconTablerCurrencyShekel,
      name: "Israeli New Shekel",
      getPriceDataset: (datasets) => datasets.date.priceInIsraeliNewShekel,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInIsraeliNewShekel,
    }),
    createPresetFolder({
      id: "inr",
      icon: IconTablerCurrencyRupee,
      name: "Indian Rupee",
      getPriceDataset: (datasets) => datasets.date.priceInIndianRupee,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInIndianRupee,
    }),
    createPresetFolder({
      id: "jpy",
      icon: IconTablerCurrencyYen,
      name: "Japanese Yen",
      getPriceDataset: (datasets) => datasets.date.priceInJapaneseYen,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInJapaneseYen,
    }),
    createPresetFolder({
      id: "krw",
      icon: IconTablerCurrencyWon,
      name: "South Korean Won",
      getPriceDataset: (datasets) => datasets.date.priceInSouthKoreanWon,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInSouthKoreanWon,
    }),
    createPresetFolder({
      id: "kwd",
      icon: IconTablerCurrencyDinar,
      name: "Kuwaiti Dinar",
      getPriceDataset: (datasets) => datasets.date.priceInKuwaitiDinar,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInKuwaitiDinar,
    }),
    createPresetFolder({
      id: "lkr",
      icon: IconTablerLetterR,
      name: "SriLankan Rupee",
      getPriceDataset: (datasets) => datasets.date.priceInSriLankanRupee,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInSriLankanRupee,
    }),
    createPresetFolder({
      id: "mmk",
      icon: IconTablerLetterK,
      name: "Burmese Kyat",
      getPriceDataset: (datasets) => datasets.date.priceInBurmeseKyat,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInBurmeseKyat,
    }),
    createPresetFolder({
      id: "mxn",
      icon: IconTablerCurrencyPeso,
      name: "Mexican Peso",
      getPriceDataset: (datasets) => datasets.date.priceInMexicanPeso,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInMexicanPeso,
    }),
    createPresetFolder({
      id: "myr",
      icon: IconTablerLetterR,
      name: "Malaysian Ringgit",
      getPriceDataset: (datasets) => datasets.date.priceInMalaysianRinggit,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInMalaysianRinggit,
    }),
    createPresetFolder({
      id: "ngn",
      icon: IconTablerCurrencyNaira,
      name: "Nigerian Naira",
      getPriceDataset: (datasets) => datasets.date.priceInNigerianNaira,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInNigerianNaira,
    }),
    createPresetFolder({
      id: "nok",
      icon: IconTablerLetterK,
      name: "Norwegian Krone",
      getPriceDataset: (datasets) => datasets.date.priceInNorwegianKrone,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInNorwegianKrone,
    }),
    createPresetFolder({
      id: "nzd",
      icon: IconTablerLetterN,
      name: "New Zealand Dollar",
      getPriceDataset: (datasets) => datasets.date.priceInNewZealandDollar,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInNewZealandDollar,
    }),
    createPresetFolder({
      id: "php",
      icon: IconTablerCurrencyPeso,
      name: "Philippine Peso",
      getPriceDataset: (datasets) => datasets.date.priceInPhilippinePeso,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInPhilippinePeso,
    }),
    createPresetFolder({
      id: "pkr",
      icon: IconTablerLetterR,
      name: "Pakistani Rupee",
      getPriceDataset: (datasets) => datasets.date.priceInPakistaniRupee,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInPakistaniRupee,
    }),
    createPresetFolder({
      id: "pln",
      icon: IconTablerCurrencyZloty,
      name: "Polish Zloty",
      getPriceDataset: (datasets) => datasets.date.priceInPolishZloty,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInPolishZloty,
    }),
    createPresetFolder({
      id: "rub",
      icon: IconTablerCurrencyRubel,
      name: "Russian Ruble",
      getPriceDataset: (datasets) => datasets.date.priceInRussianRuble,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInRussianRuble,
    }),
    createPresetFolder({
      id: "sar",
      icon: IconTablerCurrencyRiyal,
      name: "Saudi Riyal",
      getPriceDataset: (datasets) => datasets.date.priceInSaudiRiyal,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInSaudiRiyal,
    }),
    createPresetFolder({
      id: "sek",
      icon: IconTablerCurrencyKroneSwedish,
      name: "Swedish Krona",
      getPriceDataset: (datasets) => datasets.date.priceInSwedishKrona,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInSwedishKrona,
    }),
    createPresetFolder({
      id: "sgd",
      icon: IconTablerCurrencyDollarSingapore,
      name: "Singapore Dollar",
      getPriceDataset: (datasets) => datasets.date.priceInSingaporeDollar,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInSingaporeDollar,
    }),
    createPresetFolder({
      id: "thb",
      icon: IconTablerCurrencyBaht,
      name: "Thai Baht",
      getPriceDataset: (datasets) => datasets.date.priceInThaiBaht,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInThaiBaht,
    }),
    createPresetFolder({
      id: "try",
      icon: IconTablerCurrencyLira,
      name: "Turkish Lira",
      getPriceDataset: (datasets) => datasets.date.priceInTurkishLira,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInTurkishLira,
    }),
    createPresetFolder({
      id: "twd",
      icon: IconTablerCurrencyDollar,
      name: "New Taiwan Dollar",
      getPriceDataset: (datasets) => datasets.date.priceInNewTaiwanDollar,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInNewTaiwanDollar,
    }),
    createPresetFolder({
      id: "uah",
      icon: IconTablerCurrencyHryvnia,
      name: "Ukrainian Hryvnia",
      getPriceDataset: (datasets) => datasets.date.priceInUkrainianHryvnia,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInUkrainianHryvnia,
    }),
    createPresetFolder({
      id: "vef",
      icon: IconTablerLetterB,
      name: "Venezuelan Bolivar Fuerte",
      getPriceDataset: (datasets) =>
        datasets.date.priceInVenezuelanBolivarFuerte,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInVenezuelanBolivarFuerte,
    }),
    createPresetFolder({
      id: "vnd",
      icon: IconTablerCurrencyDong,
      name: "Vietnamese Dong",
      getPriceDataset: (datasets) => datasets.date.priceInVietnameseDong,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInVietnameseDong,
    }),
    createPresetFolder({
      id: "zar",
      icon: IconTablerLetterR,
      name: "South African Rand",
      getPriceDataset: (datasets) => datasets.date.priceInSouthAfricanRand,
      getMarketCapDataset: (datasets) =>
        datasets.date.marketCapitalizationInSouthAfricanRand,
    }),
  ],
};

function createPresetFolder({
  id,
  icon,
  name,
  getPriceDataset,
  getMarketCapDataset,
}: {
  id: string;
  name: string;
  icon: JSXElement;
  getPriceDataset: (datasets: Datasets) => Dataset<"date">;
  getMarketCapDataset: (datasets: Datasets) => Dataset<"date">;
}): PresetFolder {
  return {
    id: `currency-${id}`,
    name: `${id.toUpperCase()} - ${name}`,
    tree: [
      {
        id: `price-${id.toLowerCase()}`,
        // TODO: Fix types
        icon: icon as any,
        name: "Price",
        title: `Bitcoin Price In ${name}`,
        applyPreset(params) {
          return applyMultipleSeries({
            scale: "date",
            ...params,
            priceDataset: getPriceDataset(params.datasets),
          });
        },
        description: "",
      },
      {
        id: `performance-${id.toLowerCase()}`,
        icon: IconTablerPercentage,
        name: `Performance`,
        title: `Bitcoin ${name} Performance`,
        applyPreset(params) {
          return applyMultipleSeries({
            scale: "date",
            ...params,
            priceDataset: getPriceDataset(params.datasets),
            priceOptions: {
              id: "performance",
              title: "Performance",
              priceScaleOptions: {
                mode: PriceScaleMode.Percentage,
              },
            },
          });
        },
        description: "",
      },
      {
        id: `marketcap-${id.toLowerCase()}`,
        icon: IconTablerInfinity,
        name: `Market Capitalization`,
        title: `Bitcoin ${name} Market Capitalization`,
        applyPreset(params) {
          return applyMultipleSeries({
            scale: "date",
            ...params,
            priceDataset: getMarketCapDataset(params.datasets),
            priceOptions: {
              id: "marketcap",
              title: "Market Capitalization",
              // priceScaleOptions: {
              //   mode: PriceScaleMode.Percentage,
              // },
            },
          });
        },
        description: "",
      },
    ],
  };
}
