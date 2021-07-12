import { SMA } from './sma';
export class ATR {
    private prevClose: number;
    private avg: SMA;

    /**
     * Конструктор
     * @param period - период по умолчанию 14
     */
    constructor(period = 14) {
        this.avg = new SMA(period);
        this.prevClose = 0;
    }

    nextValue(high: number, low: number, close: number) {
        const trueRange = this.getTrueRange(high, low);

        this.prevClose = close;

        return this.avg.nextValue(trueRange);
    }

    momentValue(high: number, low: number) {
        const trueRange = this.getTrueRange(high, low);

        return this.avg.momentValue(trueRange);
    }

    private getTrueRange(high: number, low: number) {
        if (this.prevClose) {
            return Math.max(high - low, Math.abs(high - this.prevClose), Math.abs(low - this.prevClose));
        }

        return high - low;
    }
}

/**
 * fast abs
 * mask = input >> 31;
 * abs = ( input + mast ) ^ mask
 */
