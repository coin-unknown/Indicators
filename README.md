![npm](https://img.shields.io/npm/v/@debut/indicators)
![npm](https://img.shields.io/npm/dm/@debut/indicators)
![NPM](https://img.shields.io/npm/l/@debut/indicators)
[![GitNFT](https://img.shields.io/badge/%F0%9F%94%AE-Open%20in%20GitNFT-darkviolet?style=flat)](https://gitnft.quine.sh/app/commits/list/repo/Indicators)
# Streaming Technical Indicators
## High performance for you trading application

The main feature of these indicators is their continuous operation, which means that you can use them both for real trading and for teaching trading strategies on history, since this is a passage from the beginning to the end of the stream of candles. This approach allows you to reduce the number of necessary calculations by tens of times and is the most optimal in terms of performance.

## Features
- High performance
- Easy to use with candles streaming
- Minimal state for calculation
- Moment value (possible to calculate every tick)
- Typescript
- Unit Tested / Cross SDK Validated

## Available Indicators
- [Accelerator Oscillator (AO)](./docs/AcceleratorOscillator.md).
- Average True Range (ATR)
- Awesome Oscillator (AC).
- Average Directional Index  (ADX).
- Bollinger Bands (BB).
- Commodity Channel Index (CCI).
- Connor's RSI (CRSI)
- Donchian channels (DC).
- Exponential Moving Average (EMA).
- Exponential Weighted Moving Average (EWMA).
- Linearly weighted moving average (LWMA).
- Moving Average Convergence Divergence (MACD).
- Pivot Point Levels (classic / woodie /camarilla / fibonacci).
- Rate of Change (ROC).
- Relative Strength Index (RSI).
- Simple Moving Average (SMA).
- Smoothed Moving Average (SMMA).
- SuperTrend MTF (ST MTF).
- Stochastic Oscillator (KD)
- Wilder's Smoothed Moving Average (WEMA)
- Welles Wilder's Smoothing Average (WWS)
- Weighted moving average (WMA)
- Parabolic Stop And Reverse (PSAR)

## Candles
- Heiken Ashi.

## Utils
- Standard Deviation (SD).
- Correlation.
- Circullar buffer. This is simple streaming array for pop and push (performance optimized).
- Sampler. This is sample creator, for indicators like `SMA`, for easy getting SMA(SMA(SMA(SMA())) some sampled x-times values.
- [UniLevel](./docs/UniLevel.md). Dynamic levels for single number value 0 balanced (values between -N and +N).


## Next value (indicator.nextValue)
This method allows you to get the current value of the indicator, usually performed according to the data of a closed candle. The method call affects all subsequent calculations of the indicator readings.

## Moment value (indicator.momentValue)
The method of calculating the instantaneous value of the indicator allows you to obtain information about the indicator readings in real time, without affecting future readings. This allows you to work with the indicator inside the candle.

## Download

Releases are available under Node Package Manager (npm):

    npm install @debut/indicators

## Example with Simple Moving Average

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

|    Indicator    	|  @debut/indicators (ops/sec)  	| technicalindicators (ops/sec) 	| trading-signals (ops/sec) 	|  ta.js (ops/sec)  	|
|:---------------:	|:---------------------------------:|:---------------------------------:|:-----------------------------:|:-----------------:	|
| AwesomeOscillator |            458,936            	|             13,517             	|             732             	|         x         	|
|       ATR       	|            720,049            	|             85,709             	|            1,400             	|         x         	|
| Bollinger Bands 	|             273,562            	|              6,588             	|             62.93            	|         x         	|
|       CCI       	|             235,552            	|              9,268              	|             x             	|         x         	|
|       EMA       	|            2,451,966            	|             322,287            	|            4.90           	|      740,489      	|
|       MACD      	|            1,146,681            	|             48,323             	|             2.10             	|         x         	|
|       ROC       	|            2,256,411            	|             49,253             	|            617             	|         x         	|
|       RSI       	|            1,207,454            	|             21,272             	|            148             	|         x         	|
|       SMA       	|            2,034,006            	|             45,479             	|            1,506            	|       1,670       	|
|    Stochastic   	|             189,514            	|             20,914             	|             197             	|         x    	        |
|      WEMA     	|             937,491            	|            296,787             	|             x             	|         x    	        |
|      PSAR     	|             1,084,123            	|            166,158             	|             x             	|         x
|       ADX      	|              356,637             	|              26,581           	|             x             	|         x
|       WMA     	|             97,807            	|            22,617             	|             x             	|         x
