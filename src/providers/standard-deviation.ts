import { CircularBuffer } from './circular-buffer';
export class StandardDeviation {
    private values: CircularBuffer;

    constructor(private period: number) {
        this.values = new CircularBuffer(period);
    }

    nextValue(value: number, mean?: number) {
        this.values.push(value);

        return Math.sqrt(this.values.toArray().reduce((acc, item) => acc + (item - mean) ** 2, 0) / this.period);
    }

    momentValue(value: number, mean?: number) {
        const rm = this.values.push(value);
        const result = Math.sqrt(
            this.values.toArray().reduce((acc, item) => acc + (item - mean) ** 2, 0) / this.period,
        );
        this.values.pushback(rm);

        return result;
    }
}
