import { SMA } from './sma';

/**
 * Relative Moving Average adds more weight to recent data (and gives less importance to older data).
 * This makes the RMA similar to the Exponential Moving Average, although it’s somewhat slower to respond than an EMA is.
 */
export class RMA {
    private prevValue: number;
    private alpha: number;
    private sma: SMA;

    constructor(private period: number = 14) {
        this.alpha = 1 / period;
        this.sma = new SMA(this.period);
    }

    nextValue(value: number) {
        if (!this.prevValue) {
            this.prevValue = this.sma.nextValue(value);
        } else {
            this.prevValue = this.alpha * value + (1 - this.alpha) * this.prevValue;

            this.nextValue = (value: number) => {
                this.prevValue = this.alpha * value + (1 - this.alpha) * this.prevValue;

                return this.prevValue;
            };
        }

        return this.prevValue;
    }

    momentValue(value: number) {
        if (this.prevValue) {
            return this.alpha * value + (1 - this.alpha) * this.prevValue;
        }
    }
}
