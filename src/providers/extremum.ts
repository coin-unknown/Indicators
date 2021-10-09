import { CircularBuffer } from './circular-buffer';

export class Extremums {
    private values: CircularBuffer;
    private comparator: (a: number, b: number, c: number) => boolean;

    constructor(mode: 'max' | 'min') {
        this.values = new CircularBuffer(3);
        this.comparator = mode === 'max' ? this.maxComporator : this.minComporator;
    }

    nextValue(value: number) {
        this.values.push(value);

        const first = this.values.get(0);
        const middle = this.values.get(1);
        const last = value;

        if (this.comparator(first, middle, last)) {
            return middle;
        }
    }

    private maxComporator(a: number, b: number, c: number) {
        if (a <= b && b >= c) {
            return true;
        }

        return false;
    }

    private minComporator(a: number, b: number, c: number) {
        if (a >= b && b <= c) {
            return true;
        }

        return false;
    }
}
