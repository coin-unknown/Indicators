import { getMax, getMin } from './utils';
import { CircularBuffer } from './providers/ring-buffer';

/**
 * Donchian channels were developed by Richard Donchian, a pioneer of mechanical trend following systems.
 * The two outer bands are plotted as the highest high and lowest low for a set period,
 * originally 20 days, with the optional middle band calculated as the average of the two.
 */
export class DC {
    private highest: CircularBuffer;
    private lowest: CircularBuffer;
    private max = -Infinity;
    private min = Infinity;

    constructor(private period: number) {
        this.highest = new CircularBuffer(period);
        this.lowest = new CircularBuffer(period);
    }

    nextValue(high: number, low: number) {
        if (this.max < high) {
            this.max = high;
        }

        if (this.min > low) {
            this.min = low;
        }

        const rmMax = this.highest.push(high);
        const rmMin = this.lowest.push(low);

        if (rmMin === 0 && rmMax === 0) {
            return;
        }

        // Most perf degrade case
        if (rmMax === this.max && high !== this.max) {
            // console.count('degrade_max');

            this.max = getMax(this.highest.toArray()).max;
        }

        // Most perf degrade case
        if (rmMin === this.min && low !== this.min) {
            this.min = getMin(this.lowest.toArray()).min;
            // console.count('degrade_min');
        }

        return { upper: this.max, middle: (high + low) / 2, lower: this.min };
    }

    momentValue(high: number, low: number) {
        let max = this.max;
        let min = this.min;

        if (max < high) {
            max = high;
        }

        if (min > low) {
            min = low;
        }

        const rmMax = this.highest.push(high);
        const rmMin = this.lowest.push(low);

        if (rmMin === 0 && rmMax === 0) {
            return;
        }

        // Most perf degrade case
        if (rmMax === max && high !== max) {
            // console.count('degrade_max');

            max = getMax(this.highest.toArray()).max;
        }

        // Most perf degrade case
        if (rmMin === min && low !== min) {
            min = getMin(this.lowest.toArray()).min;
            // console.count('degrade_min');
        }

        this.highest.pushback(rmMax);
        this.lowest.pushback(rmMin);

        return { upper: this.max, middle: (high + low) / 2, lower: this.min };
    }
}
