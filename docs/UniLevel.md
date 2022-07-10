# UniLevel (Universal Level)

![universal level indicator](https://github.com/debut-js/Indicators/blob/master/docs/.github/unilevel.png)

Utility for universal construction of levels. It is used, for example, to plot the levels of the SCI, RSI, and other oscillators balanced relative to the zero point (from -N to +N).

# Examples

## Streaming calculation using nextValue

```typescript
import { EMA, UniLevel, CCI } from '@debut/indicators';

// Create rsi
const cci = new CCI(20);

// EMA smoothed universal level constructor
const levels = new UniLevel<typeof EMA>(0.99, EMA, 3, 2, 0);
const period = 12;

// Create EMA with period `period` for working with levels
levels.create(period);

// ohlc - historical candle open/high/low/close/volume format {o: number, h: number, l: number, c: number, v: number, time: number }
// get this from your broker history

ohlc.forEach(({ h, l, c }) => {
    const cciValue = cci.nextValue(h, l, c);
    const [upper, lower ] = levels.nextValue(cciValue);

    console.log(upper, lower); // Upper and lower levels for cci oscillator
});
```

## Immediate calculation using momentValue

```typescript
    // Getted new tick from stream
    const { h, l, c } = tick;
    const cciValue = cci.momentValue(h, l, c);
    const [upper, lower ] = levels.momentValue(cciValue);

    console.log(upper, lower); // Upper and lower levels for cci oscillator for current tick
});

```
