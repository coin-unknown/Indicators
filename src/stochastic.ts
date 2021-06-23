import { getMin, getMax } from './utils';
import { SMA } from './sma';

/**
 * A stochastic oscillator is a momentum indicator comparing a particular closing price
 * of a security to a range of its prices over a certain period of time.
 * The sensitivity of the oscillator to market movements is reducible by adjusting that
 * time period or by taking a moving average of the result.
 * It is used to generate overbought and oversold trading signals,
 * utilizing a 0-100 bounded range of values.
 */
export class Stochastic {
    private highs: number[] = [];
    private lows: number[] = [];
    private higestH: number | null = null;
    private lowestL: number | null = null;
    private sma: SMA;
    private filled = false;

    constructor(private period: number = 14, private smaPeriod: number = 3) {
        this.sma = new SMA(this.smaPeriod);
    }

    /**
     * Get next value for closed candle hlc
     * affect all next calculations
     */
    nextValue(high: number, low: number, close: number) {
        let { k, d, lowestL, higestH } = this.calculate(
            high,
            low,
            close,
            this.highs,
            this.lows,
            this.higestH,
            this.lowestL,
        );

        this.higestH = higestH;
        this.lowestL = lowestL;

        if (isFinite(k)) {
            d = this.sma.nextValue(k);
        } else {
            k = undefined;
        }

        return { k, d };
    }

    /**
     * Get next value for non closed (tick) candle hlc
     * does not affect any next calculations
     */
    momentValue(high: number, low: number, close: number) {
        const highs = this.highs.slice(0);
        const lows = this.lows.slice(0);

        let { k, d } = this.calculate(high, low, close, highs, lows, this.higestH, this.lowestL);

        if (isFinite(k)) {
            d = this.sma.momentValue(k);
        } else {
            k = undefined;
        }

        return { k, d };
    }

    /**
     * Calculation formula and parameters to be modified during calculation process
     */
    calculate(
        high: number,
        low: number,
        close: number,
        highs: number[],
        lows: number[],
        higestH: number,
        lowestL: number,
    ) {
        this.filled = this.filled || highs.length === this.period;

        if (this.filled) {
            if (highs.shift() === higestH) {
                higestH = null;
            }

            if (lows.shift() === lowestL) {
                lowestL = null;
            }
        }

        highs.push(high);
        lows.push(low);

        if (higestH !== null) {
            higestH = Math.max(high, higestH);
        } else if (this.filled) {
            higestH = getMax(highs).max;
        }

        if (lowestL !== null) {
            lowestL = Math.min(low, lowestL);
        } else if (lows.length === this.period) {
            lowestL = getMin(lows).min;
        }

        let k: number = ((close - lowestL) / (higestH - lowestL)) * 100;
        let d: number;

        return { k, d, higestH, lowestL };
    }
}
