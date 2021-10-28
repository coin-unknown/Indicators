import { SMA } from './sma';

/**
 * The RMA (Wilder's Smoothed Moving Average) is a powerful indicator based on the Simple Moving Average indicator.
 * The Simple Moving Average (SMA) indicator is useful to identify the start and reversal of a trend.
 */
export class RMA {
    private smooth: number;
    private rma: number;
    private sma: SMA;

    constructor(private period: number) {
        this.smooth = 1 / this.period;
        this.sma = new SMA(this.period);
    }

    /**
     * Get next value for closed candle hlc
     * affect all next calculations
     */
    nextValue(value: number) {
        if (!this.rma) {
            return (this.rma = this.sma.nextValue(value));
        }

        if (this.rma) {
            this.rma = (value - this.rma) * this.smooth + this.rma;
        }

        return this.rma;
    }

    /**
     * Get next value for non closed (tick) candle hlc
     * does not affect any next calculations
     */
    momentValue(value: number) {
        if (!this.rma) {
            return;
        }

        return (value - this.rma) * this.smooth + this.rma;
    }
}
