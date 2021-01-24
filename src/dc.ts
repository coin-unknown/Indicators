import { getMax, getMin } from "./utils";

/**
 * Donchian channels were developed by Richard Donchian, a pioneer of mechanical trend following systems.
 * The two outer bands are plotted as the highest high and lowest low for a set period,
 * originally 20 days, with the optional middle band calculated as the average of the two.
 */
export class DC {
    private highest: number[] = [];
    private lowest: number[] = [];
    private filled = false;
    private max: number = -Infinity;
    private min: number = Infinity;

    constructor(private period: number) {}

    nextValue(high: number, low: number) {
        let rmMax: number;
        let rmMin: number;

        this.filled = this.filled || this.highest.length === this.period;

        if (this.max < high) {
            this.max = high;
        }

        if (this.min > low) {
            this.min = low;
        }

        if (this.filled) {
            rmMax = this.highest.shift();
            rmMin = this.lowest.shift();
        }

        // Most perf degrade case
        if (rmMax === this.max && high !== this.max) {
            // console.count('degrade_max');

            this.max = getMax(this.highest).max;
        }

        // Most perf degrade case
        if (rmMin === this.min && low !== this.min) {
            this.min = getMin(this.lowest).min;
            // console.count('degrade_min');
        }

        this.highest.push(high);
        this.lowest.push(low);

        if (!this.filled) {
            return;
        }

        return { upper: this.max, middle: (high + low) / 2, lower: this.min };
    }

    // momentValue(high: number, low: number) {
    //     let rmMax: number;
    //     let rmMin: number;
    //     let max = this.max;
    //     let min = this.min;

    //     if (!this.filled) {
    //         return;
    //     }

    //     if (this.filled) {
    //         rmMax = this.highest[0];
    //         rmMin = this.lowest[0];
    //     }

    //     // Most perf degrade case
    //     if (rmMax === max) {
    //         max = getMax(this.highest.slice(1)).max;
    //     }

    //     // Most perf degrade case
    //     if (rmMin === min) {
    //         min = getMin(this.lowest.slice(1)).min;
    //     }

    //     if (max < high) {
    //         max = high;
    //     }

    //     if (min > low) {
    //         min = low;
    //     }

    //     return { upper: this.max, middle: (high - low) / 2, lower: this.min };
    // }
}
