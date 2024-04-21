import {
  amber as amberTailwind,
  blue as blueTailwind,
  cyan as cyanTailwind,
  emerald as emeraldTailwind,
  fuchsia as fuchsiaTailwind,
  neutral as grayTailwind,
  green as greenTailwind,
  indigo as indigoTailwind,
  lime as limeTailwind,
  orange as orangeTailwind,
  pink as pinkTailwind,
  purple as purpleTailwind,
  red as redTailwind,
  rose as roseTailwind,
  sky as skyTailwind,
  teal as tealTailwind,
  violet as violetTailwind,
  yellow as yellowTailwind,
} from "tailwindcss/colors";

const lightRed = redTailwind[300];
const red = redTailwind[500];
const darkRed = redTailwind[900];
const orange = orangeTailwind[500];
const darkOrange = orangeTailwind[900];
const amber = amberTailwind[500];
const darkAmber = amberTailwind[900];
const yellow = yellowTailwind[500];
const darkYellow = yellowTailwind[500];
const lime = limeTailwind[500];
const darkLime = limeTailwind[900];
const green = greenTailwind[500];
const darkGreen = greenTailwind[900];
const emerald = emeraldTailwind[500];
const darkEmerald = emeraldTailwind[900];
const teal = tealTailwind[500];
const darkTeal = tealTailwind[900];
const cyan = cyanTailwind[500];
const darkCyan = cyanTailwind[900];
const sky = skyTailwind[500];
const darkSky = skyTailwind[900];
const blue = blueTailwind[500];
const darkBlue = blueTailwind[900];
const indigo = indigoTailwind[500];
const darkIndigo = indigoTailwind[900];
const violet = violetTailwind[500];
const darkViolet = violetTailwind[900];
const purple = purpleTailwind[500];
const darkPurple = purpleTailwind[900];
const fuchsia = fuchsiaTailwind[500];
const darkFuchsia = fuchsiaTailwind[900];
const pink = pinkTailwind[500];
const darkPink = pinkTailwind[900];
const rose = roseTailwind[500];
const darkRose = roseTailwind[900];

const darkWhite = grayTailwind[400];
const gray = grayTailwind[600];

const black = "#000000";
const white = "#ffffff";

export const convertCandleToCandleColor = (
  candle: { close: number; open: number },
  inverse?: boolean,
) =>
  (candle.close || 1) > (candle.open || 0)
    ? !inverse
      ? green
      : red
    : !inverse
      ? red
      : green;

export const convertCandleToVolumeColor = (
  candle: { close: number; open: number },
  inverse?: boolean,
) =>
  (candle.close || 1) > (candle.open || 0)
    ? !inverse
      ? darkGreen
      : darkRed
    : !inverse
      ? darkRed
      : darkGreen;

export const colors = {
  white,
  darkWhite,
  gray,
  bitcoin: orange,
  darkBitcoin: darkOrange,
  dollars: emerald,
  closes7DMA: yellow,
  closes30DMA: orange,
  closes111DMA: green,
  closes200DMA: blue,
  closes1YMA: red,
  closes2YMA: purple,
  closes4YMA: pink,
  p2pk: lime,
  p2pkh: violet,
  p2sh: emerald,
  p2wpkh: cyan,
  p2wsh: pink,
  p2tr: blue,
  crab: red,
  fish: lime,
  humpback: violet,
  plankton: emerald,
  shark: cyan,
  shrimp: pink,
  whale: blue,
  megalodon: purple,
  realizedPrice: orange,
  oneMonthHolders: cyan,
  threeMonthsHolders: lime,
  sth: yellow,
  sixMonthsHolder: red,
  oneYearHolders: pink,
  twoYearsHolders: purple,
  lth: fuchsia,
  balancedPrice: yellow,
  cointimePrice: yellow,
  trueMarketMeanPrice: blue,
  vaultedPrice: green,
  cvdd: lime,
  terminalPrice: red,
  loss: red,
  darkLoss: darkRed,
  profit: green,
  darkProfit: darkGreen,
  thermoCap: green,
  investorCap: rose,
  realizedCap: purple,
  ethereum: indigo,
  usdt: emerald,
  usdc: blue,
  ust: red,
  busd: yellow,
  usdd: emerald,
  frax: gray,
  dai: amber,
  tusd: indigo,
  pyusd: blue,
  darkLiveliness: darkRose,
  liveliness: rose,
  vaultedness: green,
  activityToVaultednessRatio: violet,
  from10yToEnd: purple,
  from7yTo10y: violet,
  from5yTo7y: indigo,
  from3yTo5y: sky,
  from2yTo3y: teal,
  from1yTo2y: green,
  from6mTo1y: lime,
  from3mTo6m: yellow,
  from1mTo3m: amber,
  from1wTo1m: orange,
  from1dTo1w: red,
  upTo1d: lightRed,
  upTo1w: red,
  upTo1m: orange,
  upTo2m: orange,
  upTo3m: orange,
  upTo4m: orange,
  upTo5m: orange,
  upTo6m: orange,
  upTo1y: orange,
  upTo2y: orange,
  upTo3y: orange,
  upTo4y: orange,
  upTo5y: orange,
  upTo7y: orange,
  upTo10y: orange,
  coinblocksCreated: purple,
  coinblocksDestroyed: red,
  coinblocksStored: green,
  momentum: [green, yellow, red],
  momentumGreen: green,
  momentumYellow: yellow,
  momentumRed: red,
  extremeMax: red,
  extremeMiddle: orange,
  extremeMin: yellow,
  2009: yellow,
  2010: yellow,
  2011: yellow,
  2012: yellow,
  2013: yellow,
  2014: yellow,
  2015: yellow,
  2016: yellow,
  2017: yellow,
  2018: yellow,
  2019: yellow,
  2020: yellow,
  2021: yellow,
  2022: yellow,
  2023: yellow,
  2024: yellow,
};
