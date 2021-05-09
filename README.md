# Streaming Technical Indicators
## High performance for you trading application

The main feature of these indicators is their continuous operation, which means that you can use them both for real trading and for teaching trading strategies on history, since this is a passage from the beginning to the end of the stream of candles. This approach allows you to reduce the number of necessary calculations by tens of times and is the most optimal in terms of performance.

# [Benchmarks](https://github.com/follow-traders/indicators-benchmark)
```
-- SMA 13x faster --
@follow-traders/indicators SMA x 61,283 ops/sec
technicalindicators SMA x 4,526 ops/sec

-- EMA 3x faster --
@follow-traders/indicators EMA x 88,705 ops/sec
technicalindicators EMA x 27,581 ops/sec

-- CCI 36x faster --
@follow-traders/indicators CCI x 29,604 ops/sec
technicalindicators CCI x 832 ops/sec

and more ...
```
## Features
- High perfomance
- Easy to use with candles streaming
- Minimal state for calculation
- Moment value (possible to calculate every tick)
- Typescript

## Next value (indicator.nextValue)
This method allows you to get the current value of the indicator, usually performed according to the data of a closed candle. The method call affects all subsequent calculations of the indicator readings.

## Moment value (indicator.momentValue)
The method of calculating the instantaneous value of the indicator allows you to obtain information about the indicator readings in real time, without affecting future readings. This allows you to work with the indicator inside the candle.

## Download

Releases are available under Node Package Manager (npm):

    npm install @follow-traders/indicators

## Exapmle with Simple Moving Average

```js
import { SMA } from '@follow-traders/indicators';
const sma = new SMA(4); // Create SMA with 4 period

// SMA workflow
//=> [ '2.50', '3.50', '4.50', '5.50', '6.50', '7.50' ]
//=>   │       │       │       │       │       └─(6+7+8+9)/4
//=>   │       │       │       │       └─(5+6+7+8)/4
//=>   │       │       │       └─(4+5+6+7)/4
//=>   │       │       └─(3+4+5+6)/4
//=>   │       └─(2+3+4+5)/4
//=>   └─(1+2+3+4)/4

sma.nextValue(1); // undefiend
sma.nextValue(2); // undefiend
sma.nextValue(3); // undefiend
sma.nextValue(4); // 2.50
sma.nextValue(5); // 3.50
sma.nextValue(6); // 4.50
sma.nextValue(7); // 5.50
sma.momentValue(8); // 6.50
sma.nextValue(8); // 6.50
sma.momentValue(9); // 7.50
sma.nextValue(9); // 7.50

```
### Currently available indicators
- SMA
- EMA
- RSI
- Connors RSI (cRSI)
- CCI
- STOCHASTIC
- ATR
- BOLLINGER BANDS
- ROC
- MACD

### Extra indicators by FT
- MOVE (direction move with power no less than p)
- WAVE (directional move with bearish or bullish candle series and power p)
