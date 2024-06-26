import { dateToString } from "../../utils/date";
import { ONE_DAY_IN_MS } from "../../utils/time";

export const krakenAPI = {
  createLiveCandleWebsocket(
    callback: (candle: DatasetCandlestickData) => void,
  ) {
    const ws = new WebSocket("wss://ws.kraken.com");

    ws.addEventListener("open", () => {
      ws.send(
        JSON.stringify({
          event: "subscribe",
          pair: ["XBT/USD"],
          subscription: {
            name: "ohlc",
            interval: 1440,
          },
        }),
      );
    });

    ws.addEventListener("message", (message) => {
      const result = JSON.parse(message.data);

      if (!Array.isArray(result)) return;

      const [timestamp, _, open, high, low, close, __, volume] = result[1];

      const dateStr = dateToString(new Date(Number(timestamp) * 1000));

      const candle: DatasetCandlestickData = {
        // date: dateStr,
        number: new Date(dateStr).valueOf() / ONE_DAY_IN_MS,
        time: dateStr,
        open: Number(open),
        high: Number(high),
        low: Number(low),
        close: Number(close),
        value: Number(close),
        // volume: Number(volume),
      };

      candle && callback({ ...candle });
    });

    return ws;
  },
};
