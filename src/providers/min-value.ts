import { CircularBuffer } from './circular-buffer';
import { getMin } from '../utils';

/**
 * Provider for fast detection highs and lows in period
 */
export class MinProvider {
    private lowest: CircularBuffer;
    private min = Infinity;

    public constructor(period: number) {
        this.lowest = new CircularBuffer(period);
    }

    filled() {
        return this.lowest.filled;
    }

    nextValue(low: number) {
        if (this.min > low) {
            this.min = low;
        }

        const rmMin = this.lowest.push(low);

        // Most perf degrade case
        if (rmMin === this.min && low !== this.min) {
            this.min = getMin(this.lowest.toArray());
            // console.count('degrade_min');
        }

        return this.min;
    }

    momentValue(low: number) {
        return this.min < low ? this.min : low;
    }
}
