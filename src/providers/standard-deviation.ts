import { avg } from '../utils';
export class StandardDeviationProvider {
    private values: number[] = [];

    constructor(private period: number) { }

    nextValue(value: number, mean?: number) {
        return this.calculate(this.values, value, mean);
    }

    momentValue(value: number, mean?: number) {
        return this.calculate(this.values.slice(0), value, mean);
    }

    calculate(values: number[], value: number, mean?: number) {
        if (values.length === this.period) {
            values.shift();
        }

        values.push(value);

        if (!mean) {
            return;
        }

        return Math.sqrt(values.reduce((acc, item) => acc + (item - mean) ** 2, 0) / this.period);

    }
}
