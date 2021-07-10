import { SMA } from '../../src/sma';

const ticks = [120, 150, 240, 540, 210, 380, 120, 870, 250, 1100, 500, 950];

const sma2 = new SMA(2);
const sma4 = new SMA(4);
const sma6 = new SMA(6);

// Interval = 2:  135 195 390 375 295 250 495 560 675 800 725
// Interval = 4:  262,5	285	342,5 312,5	395	405	585	680	700
// Interval = 6:  273,333333333333 273,333333333333	393,333333333333 395 488,333333333333 536,666666666667 631,666666666667

ticks.forEach((tick) => {
    console.log(sma2.momentValue(tick), sma2.nextValue(tick));
    // console.log(sma4.momentValue(tick), sma4.nextValue(tick));
    // console.log(sma6.momentValue(tick), sma6.nextValue(tick));
    // cci.nextValue(tick.h, tick.l, tick.c);
});
