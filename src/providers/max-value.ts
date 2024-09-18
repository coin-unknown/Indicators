import { CircularBuffer } from './circular-buffer';
import { getMax } from '../utils';

/**
 * Provider for fast detection highs and lows in period
 */
export class MaxProvider {
    private highest: CircularBuffer;
    private max = -Infinity;

    public constructor(period: number) {
        this.highest = new CircularBuffer(period);
    }

    filled() {
        return this.highest.filled;
    }

    nextValue(high: number) {
        if (this.max < high) {
            this.max = high;
        }

        const rmMax = this.highest.push(high);

        // Most perf degrade case
        if (rmMax === this.max && high !== this.max) {
            // console.count('degrade_max');

            this.max = getMax(this.highest.toArray());
        }

        return this.max;
    }

    momentValue(high: number) {
        return this.max > high ? this.max : high;
    }
}
