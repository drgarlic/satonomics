https://pro.kraken.com/app/trade/btc-usd

Scroll to the left as far as needed, get the data from the Network tab, store it in x then:

```js
x.result[0].candlesticks.map((c) => ({
  date: new Date(c.ct * 1000).toJSON().split("T")[0],
  open: Number(c.op),
  high: Number(c.hp),
  low: Number(c.lp),
  close: Number(c.cp),
  volume: Number(c.v),
}));
```
