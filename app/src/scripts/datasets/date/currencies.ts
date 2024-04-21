import { createMultipliedLazyDataset, createResourceDataset } from "../base";

export function createCurrencyDatasets(supplyTotal: Dataset<"date">) {
  type Datasets = Record<`priceIn${CurrencyKey}`, ResourceDataset<"date">> &
    Record<`marketCapitalizationIn${CurrencyKey}`, Dataset<"date">>;

  const partial: Partial<Datasets> = {};

  currencies.forEach(({ key, symbol }) => {
    const price = createResourceDataset({
      scale: "date",
      path: `/vs-currency?currency=${symbol.toUpperCase()}`,
    });

    partial[`priceIn${key}`] = price;

    partial[`marketCapitalizationIn${key}`] = createMultipliedLazyDataset(
      supplyTotal,
      price,
    );
  });

  return partial as Datasets;
}

export const fiat = [
  {
    key: "IndonesianRupiah",
    symbol: "IDR",
  },
  {
    key: "NewTaiwanDollar",
    symbol: "TWD",
  },
  {
    key: "Euro",
    symbol: "EUR",
  },
  {
    key: "SouthKoreanWon",
    symbol: "KRW",
  },
  {
    key: "JapaneseYen",
    symbol: "JPY",
  },
  {
    key: "RussianRuble",
    symbol: "RUB",
  },
  {
    key: "ChineseYuan",
    symbol: "CNY",
  },
  {
    key: "UnitedArabEmiratesDirham",
    symbol: "AED",
  },
  {
    key: "ArgentinePeso",
    symbol: "ARS",
  },
  {
    key: "AustralianDollar",
    symbol: "AUD",
  },
  {
    key: "BangladeshiTaka",
    symbol: "BDT",
  },
  {
    key: "BangladeshiTaka",
    symbol: "BDT",
  },
  { key: "BahrainiDinar", symbol: "BHD" },
  { key: "BermudianDollar", symbol: "BMD" },
  { key: "BrazilReal", symbol: "BRL" },
  { key: "CanadianDollar", symbol: "CAD" },
  { key: "SwissFranc", symbol: "CHF" },
  { key: "ChileanPeso", symbol: "CLP" },
  { key: "CzechKoruna", symbol: "CZK" },
  { key: "DanishKrone", symbol: "DKK" },
  { key: "BritishPoundSterling", symbol: "GBP" },
  { key: "GeorgianLari", symbol: "GEL" },
  { key: "HongKongDollar", symbol: "HKD" },
  { key: "HungarianForint", symbol: "HUF" },
  { key: "IsraeliNewShekel", symbol: "ILS" },
  { key: "IndianRupee", symbol: "INR" },
  { key: "KuwaitiDinar", symbol: "KWD" },
  { key: "SriLankanRupee", symbol: "LKR" },
  { key: "BurmeseKyat", symbol: "MMK" },
  { key: "MexicanPeso", symbol: "MXN" },
  { key: "MalaysianRinggit", symbol: "MYR" },
  { key: "NigerianNaira", symbol: "NGN" },
  { key: "NorwegianKrone", symbol: "NOK" },
  { key: "NewZealandDollar", symbol: "NZD" },
  { key: "PhilippinePeso", symbol: "PHP" },
  { key: "PakistaniRupee", symbol: "PKR" },
  { key: "PolishZloty", symbol: "PLN" },
  { key: "SaudiRiyal", symbol: "SAR" },
  { key: "SwedishKrona", symbol: "SEK" },
  { key: "SingaporeDollar", symbol: "SGD" },
  { key: "ThaiBaht", symbol: "THB" },
  { key: "TurkishLira", symbol: "TRY" },
  { key: "UkrainianHryvnia", symbol: "UAH" },
  { key: "VenezuelanBolivarFuerte", symbol: "VEF" },
  { key: "VietnameseDong", symbol: "VND" },
  { key: "SouthAfricanRand", symbol: "ZAR" },
] as const;

export const metals = [
  { key: "Gold", symbol: "XAU" },
  { key: "Silver", symbol: "XAG" },
] as const;

export const currencies = [...fiat, ...metals] as const;

type CurrencyKey = (typeof currencies)[number]["key"];
