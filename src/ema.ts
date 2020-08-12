import { SMA } from './sma';

/**
 * An exponential moving average (EMA) is a type of moving average (MA)
 * that places a greater weight and significance on the most recent data points.
 * The exponential moving average is also referred to as the exponentially weighted moving average.
 * An exponentially weighted moving average reacts more significantly to recent price changes
 * than a simple moving average (SMA), which applies an equal weight to all observations in the period.
 */
export class EMA {
    private arr: number[] = [];
    private sma: SMA;
    private smooth: number;

    constructor(private period: number) {
        this.sma = new SMA(period);
        this.smooth = 2 / (period + 1);
    }

    /**
     * Get next value for closed candle hlc
     * affect all next calculations
     */
    nextValue(value: number) {
        if (this.arr.length === this.period) {
            this.arr.shift();
        }

        this.arr.push(value);
        let ema = this.sma.nextValue(value);

        if (!ema) {
            return;
        }

        for (let i = this.period; i < this.arr.length; i++) {
            ema = this.smooth * this.arr[i] + (1 - this.smooth) * ema;
        }

        return ema;
    }

     /**
     * Get next value for non closed (tick) candle hlc
     * does not affect any next calculations
     */
    momentValue(value: number) {
        const arr = this.arr.slice(0);

        if (arr.length === this.period) {
            arr.shift();
        }

        arr.push(value);
        let ema = this.sma.momentValue(value);

        if (!ema) {
            return;
        }

        for (let i = this.period; i < arr.length; i++) {
            ema = this.smooth * arr[i] + (1 - this.smooth) * ema;
        }

        return ema;
    }
}
