# Accelerator Oscillator (AO).

Accelerator Oscillator (AC) belongs to the group of oscillators, is an indicator of the deceleration or acceleration of the driving force of the traded asset.

The creator of this indicator is a well-known trader and author of a number of books on stock trading Bill Williams. Accelerator Oscillator is based on the principle of increasing or decreasing the speed of price movement. When reversing the price movement, the speed will slow down, and the development of market movement increases and the acceleration of prices. Noticing the peculiarities of the change in the rate of price, Williams developed an indicator to recognize this change to use such features to determine the points of opening and closing of trading positions.

# Examples

## Streaming calculation using nextValue

```javascript
import { AO } from '@debut/indicators';

const fastPeriod = 5;
const slowPeriod = 34
const ao = new AO(fastPeriod, slowPeriod);

// ohlc - historical candle open/high/low/close/volume format {o: number, h: number, l: number, c: number, v: number, time: number }
// get this from your broker history

ohlc.forEach(({ o, h, l, c, v}) => {
    const aoValue = ao.nextValue(h, l);

    console.log(aoValue); // Accelerator Oscillator calculated value for current candle
});
```

## Immediate calculation using momentValue

```javascript
import { AO } from '@debut/indicators';

const fastPeriod = 5;
const slowPeriod = 34
const ao = new AO(fastPeriod, slowPeriod);

// Last tick for now, getted from broker websocket ticks stream
const lastTick = { o: 12, h: 14, l: 13, c: 14, v: 156, time: 1642694284515 };
const aoValue = ao.momentValue(h, l);
console.log(aoValue); // Accelerator Oscillator calculated value for current tick

// When candle closed call nextValue for candle data
ao.nextValue(...);
```

## How to calculate Accelerator Oscillator (AC) in excel spreadsheet?

[Download excel sample](../tests/ac/awesome-and-accelerator-oscillators.xlsx)
