import { SMMA } from './smma';
import { EMA } from './ema';
import { WEMA } from './wema';
import { LWMA } from './lwma';
import { SMA } from './sma';
import { EWMA } from './ewma';
export class ATR {
    private prevClose: number;
    private avg: EMA | SMMA | WEMA | LWMA | SMA | EWMA;

    /**
     * Конструктор
     * @param period - период по умолчанию 14
     */
    constructor(period = 14, smoothing: 'SMA' | 'EMA' | 'SMMA' | 'WEMA' | 'LWMA' | 'EWMA' = 'WEMA') {
        switch (smoothing) {
            case 'SMA':
                this.avg = new SMA(period);
                break;
            case 'EMA':
                this.avg = new EMA(period);
                break;
            case 'SMMA':
                this.avg = new SMMA(period);
                break;
            case 'WEMA':
                this.avg = new WEMA(period);
                break;
            case 'LWMA':
                this.avg = new LWMA(period);
                break;
            case 'EWMA':
                this.avg = new EWMA(0.2);
                break;
        }

        this.prevClose = 0;
    }

    nextValue(high: number, low: number, close: number) {
        const trueRange = this.getTrueRange(high, low);

        this.prevClose = close;

        if (!trueRange) {
            return;
        }

        return this.avg.nextValue(trueRange);
    }

    momentValue(high: number, low: number) {
        const trueRange = this.getTrueRange(high, low);

        if (!trueRange) {
            return;
        }

        return this.avg.momentValue(trueRange);
    }

    private getTrueRange(high: number, low: number) {
        if (this.prevClose) {
            // Linear conditions without max min and abs
            // Perormance reason
            const hl = high - low;
            const hc = high > this.prevClose ? high - this.prevClose : this.prevClose - high;
            const lc = low > this.prevClose ? low - this.prevClose : this.prevClose - low;

            if (hl > hc && hl > lc) {
                return hl;
            }

            if (hc > hl && hc > lc) {
                return hc;
            }

            return lc;

            // return Math.max(high - low, Math.abs(high - this.prevClose), Math.abs(low - this.prevClose));
        }

        return null;
    }
}

/**
 * fast abs
 * mask = input >> 31;
 * abs = ( input + mast ) ^ mask
 */
