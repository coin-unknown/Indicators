import { SMA } from './sma';
import { StandardDeviation } from './standard-deviation';
export class BollingerBands {
    private sd: StandardDeviation;
    private sma: SMA;
    private filled = false;

    constructor(period = 20, private stdDev: number = 2) {
        this.sma = new SMA(period);
        this.sd = new StandardDeviation(period);
    }

    nextValue(close: number) {
        const middle = this.sma.nextValue(close);
        const sd = this.sd.nextValue(close, middle);

        this.filled = this.filled || !!(sd && middle);

        if (!this.filled) {
            return;
        }

        const lower = middle - this.stdDev * sd;
        const upper = middle + this.stdDev * sd;

        return { lower, middle, upper };
    }

    momentValue(close: number) {
        if (!this.filled) {
            return;
        }

        const middle = this.sma.momentValue(close);
        const sd = this.sd.momentValue(close, middle);
        const lower = middle - this.stdDev * sd;
        const upper = middle + this.stdDev * sd;

        return { lower, middle, upper };
    }
}
