import { getMin, getMax } from './utils';
import { SMA } from './sma';

export class Stochastic {
    private highs: number[] = [];
    private lows: number[] = [];
    private higestH: number | null = null;
    private lowestL: number | null = null;
    private sma: SMA;

    constructor(private period: number, private smaPeriod: number = 3) {
        this.sma = new SMA(this.smaPeriod);
    }

    nextValue(high: number, low: number, close: number) {
        if (this.highs.length === this.period) {
            if (this.highs.shift() === this.higestH) {
                this.higestH = null;
            }

            if (this.lows.shift() === this.lowestL) {
                this.lowestL = null;
            }
        }

        this.highs.push(high);
        this.lows.push(low);

        if (this.higestH !== null) {
            this.higestH = Math.max(high, this.higestH);
        } else if (this.highs.length === this.period) {
            this.higestH = getMax(this.highs).max;
        }

        if (this.lowestL !== null) {
            this.lowestL = Math.min(low, this.lowestL);
        } else if (this.lows.length === this.period) {
            this.lowestL = getMin(this.lows).min;
        }

        let k: number = ((close - this.lowestL) / (this.higestH - this.lowestL)) * 100;
        let d: number;

        if (isFinite(k)) {
            d = this.sma.nextValue(k);
        } else {
            k = undefined;
        }

        return { k, d };
    }
}
