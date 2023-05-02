import { SMA } from './sma';
import { MaxProvider } from './providers/max-value';
import { MinProvider } from './providers/min-value';

/**
 * A stochastic oscillator is a momentum indicator comparing a particular closing price
 * of a security to a range of its prices over a certain period of time.
 * The sensitivity of the oscillator to market movements is reducible by adjusting that
 * time period or by taking a moving average of the result.
 * It is used to generate overbought and oversold trading signals,
 * utilizing a 0-100 bounded range of values.
 */
export class Stochastic {
    private max: MaxProvider;
    private min: MinProvider;
    private sma: SMA;

    constructor(private period: number = 14, private smaPeriod: number = 3) {
        this.sma = new SMA(this.smaPeriod);
        this.max = new MaxProvider(period);
        this.min = new MinProvider(period);
    }

    /**
     * Get next value for closed candle hlc
     * affect all next calculations
     */
    nextValue(high: number, low: number, close: number) {
        const max = this.max.nextValue(high);
        const min = this.min.nextValue(low);

        if (!this.max.filled) {
            return;
        }

        const k: number = ((close - min) / (max - min)) * 100;
        const d: number = this.sma.nextValue(k);

        return { k, d };

            // this.momentValue = (high: number, low: number, close: number) => {
            //     const rmHigh = this.highs.push(high);
            //     const rmLow = this.lows.push(low);
            //     let higestH = this.higestH;
            //     let lowestL = this.lowestL;

            //     if (higestH === rmHigh) {
            //         higestH = getMax(this.highs.toArray());
            //     } else if (higestH < high) {
            //         higestH = high;
            //     }

            //     if (lowestL === rmLow) {
            //         lowestL = getMin(this.lows.toArray());
            //     } else if (lowestL > low) {
            //         lowestL = low;
            //     }

            //     this.highs.pushback(rmHigh);
            //     this.lows.pushback(rmLow);

            //     const k: number = ((close - lowestL) / (higestH - lowestL)) * 100;
            //     const d: number = this.sma.momentValue(k);

            //     return { k, d };
            // };
    }

    /**
     * Get next value for non closed (tick) candle hlc
     * does not affect any next calculations
     */
    momentValue(high: number, low: number, close: number): { k: number; d: number } {
        return;
    }
}
