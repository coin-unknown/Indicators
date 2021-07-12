import { RSI } from '../../src/rsi';

const ticks =

const rsi = new RSI(14);
ticks.forEach((tick) => {
    console.log(rsi.momentValue(tick.c), rsi.nextValue(tick.c));
});
