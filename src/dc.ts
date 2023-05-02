import { Heap } from './providers/binary-heap';

/**
 * Donchian channels were developed by Richard Donchian, a pioneer of mechanical trend following systems.
 * The two outer bands are plotted as the highest high and lowest low for a set period,
 * originally 20 days, with the optional middle band calculated as the average of the two.
 */
export class DC {
    private highest: Heap;
    private lowest: Heap;

    constructor(period = 20) {
        this.highest = new Heap(Heap.maxComparator, period + 1);
        this.lowest = new Heap(Heap.minComparator, period + 1);
    }

    nextValue(high: number, low: number) {
        this.highest.push(high);
        this.lowest.push(low);

        if (!this.highest.filled) {
            return;
        }

        const upper = this.highest.peek();
        const lower = this.lowest.peek();

        return { upper, middle: (upper + lower) / 2, lower };
    }

    momentValue(high: number, low: number) {
        let upper = this.highest.peek();
        let lower = this.lowest.peek();

        if (high > upper) {
            upper = high;
        }

        if (low < lower) {
            lower = low;
        }

        return { upper, middle: (upper + lower) / 2, lower };
    }
}
