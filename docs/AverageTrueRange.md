# Average True Range (ATR)
The Average True Range (ATR) is a measure of market volatility. It calculates the average range between the high and low prices over a specified period. This indicator helps traders gauge the strength of a trend and the level of price volatility, which can be crucial for making informed trading decisions.

# Examples

## Streaming calculation using nextValue


```javascript
import { ATR } from '@debut/indicators';

const period = 5;
const atr = new ATR(period, 'WEMA');

// ohlc - historical candle open/high/low/close/volume format {o: number, h: number, l: number, c: number, v: number, time: number }
// get this from your broker history

ohlc.forEach(({ o, h, l, c, v}) => {
    const atrValue = atr.nextValue(h, l, c);

    console.log(atrValue); // Average True Range calculated value for current candle
});
```

## Immediate calculation using momentValue

```javascript
import { ATR } from '@debut/indicators';

const period = 5;
const atr = new ATR(period, 'WEMA');

// Last tick for now, getted from broker websocket ticks stream
const lastTick = { o: 12, h: 14, l: 13, c: 14, v: 156, time: 1642694284515 };
const atrValue = atr.momentValue(h, l);
console.log(atrValue); //  Average True Range calculated value for current tick

// When candle closed call nextValue for candle data
atr.nextValue(...);
```

## How to calculate Average True Range (ATR) in excel spreadsheet?

[Download excel sample](../tests/atr/Average-True-Range.xlsx)