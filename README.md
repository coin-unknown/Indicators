![npm](https://img.shields.io/npm/v/@debut/indicators)
![npm](https://img.shields.io/npm/dm/@debut/indicators)
![NPM](https://img.shields.io/npm/l/@debut/indicators)
# Streaming Technical Indicators
## High performance for you trading application

The main feature of these indicators is their continuous operation, which means that you can use them both for real trading and for teaching trading strategies on history, since this is a passage from the beginning to the end of the stream of candles. This approach allows you to reduce the number of necessary calculations by tens of times and is the most optimal in terms of performance.

## Features
- High perfomance
- Easy to use with candles streaming
- Minimal state for calculation
- Moment value (possible to calculate every tick)
- Typescript
- Unit Tested / Cross SDK Validated

## Available Indicators
- Average True Range (ATR)
- Bollinger Bands (BB).
- Commodity Channel Index (CCI).
- Connor's RSI (CRSI)
- Donchian channels (DC).
- Linearly weighted moving average (LWMA).
- Moving Average Convergence Divergence (MACD).
- Pivot Point Levels (classic / woodie /camarilla / fibonacci).
- Rate of Change (ROC).
- Relative Strength Index (RSI).
- Relative Moving Average (RMA)
- Simple Moving Average (SMA).
- Smoothed Moving Average (SMMA).
- Stochastic Oscillator (KD).
- Exponential Moving Average (EMA).
- Weighted Moving Average (WMA).

## Candles
- Heiken Ashi.

## Utils
- Standard Deviation (SD).
- Correlation.
## Next value (indicator.nextValue)
This method allows you to get the current value of the indicator, usually performed according to the data of a closed candle. The method call affects all subsequent calculations of the indicator readings.

## Moment value (indicator.momentValue)
The method of calculating the instantaneous value of the indicator allows you to obtain information about the indicator readings in real time, without affecting future readings. This allows you to work with the indicator inside the candle.

## Download

Releases are available under Node Package Manager (npm):

    npm install @debut/indicators

## Exapmle with Simple Moving Average

```js
import { SMA } from '@debut/indicators';
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
### Extra custom indicators
- MOVE (direction move with power no less than p)
- WAVE (directional move with bearish or bullish candle series and power p)

## [Benchmarks](https://github.com/follow-traders/indicators-benchmark)
|    Indicator    	| Performance ops/sec 	                                                    ||||
|:---------------:	|:-------------------:	|:-------------------:	|:---------------:	|:-------:	|
|        x        	|  @debut/indicators  	| technicalindicators 	| trading-signals 	|  ta.js  	|
|       ATR       	|       165,378       	|        9,272        	|        x        	|    x    	|
| Bollinger Bands 	|        42,931       	|         585         	|        x        	|    x    	|
|       CCI       	|        33,284       	|         866         	|        x        	|    x    	|
|       EMA       	|       243,620       	|        22,004       	|       0.13      	| 100,070 	|
|       MACD      	|       123,751       	|        4,658        	|        x        	|    x    	|
|       ROC       	|       223,991       	|        4,766        	|        x        	|    x    	|
|       SMA       	|       215,303       	|        3,754        	|       120       	|  1,670  	|
|    Stochastic   	|        27,363       	|        2,156        	|       0.13      	|    x    	|
