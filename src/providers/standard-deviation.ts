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

    calculate(values: number[], value: number, mean?: number) {}
}

export class StandardDeviationTwo {
    public v: number = 0;
    private w: number = 0;
    private S: number = 0;
    private count: number = 0;

    // Add a measurement. Also calculates updates to stepwise parameters which are later used
    // to determine sigma.
    public add(measurement: number) {
        this.count += 1;
        this.w = this.v;
        this.v = this.v + (measurement - this.v) / this.count;
        this.S = this.S + (measurement - this.w) * (measurement - this.v);
    }

    // Performs the final step needed to get the standard deviation and returns it.
    public get() {
        if (this.count < 2) {
            // There are less measurements accumulated than necessary to perform computation
            return 0.0;
        } else {
            return Math.sqrt(this.S / (this.count - 1));
        }
    }

    // Replaces the value x currently present in this sample with the
    // new value y. In a sliding window, x is the value that
    // drops out and y is the new value entering the window. The sample
    // count remains constant with this operation.
    public replace(x: number, y: number) {
        const deltaYX = y - x;
        const deltaX = x - this.v;
        const deltaY = y - this.v;
        this.v = this.v + deltaYX / this.count;
        const deltaYp = y - this.v;
        const countMinus1 = this.count - 1;
        this.S = this.S - this.count / countMinus1 * (deltaX * deltaX - deltaY * deltaYp) - deltaYX * deltaYp / countMinus1;
    }

    // Remove a measurement. Also calculates updates to stepwise parameters which are later used
    // to determine sigma.
    public remove(x: number) {
        this.w = (this.count * this.v - x) / (this.count - 1);
        this.S -= (x - this.v) * (x - this.w);
        this.v = this.w;
        this.count -= 1;
    }
}
