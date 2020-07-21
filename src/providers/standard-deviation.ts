import { avg } from '../utils';
export class StandardDeviationProvider {
    private values: number[] = [];

    constructor(private period: number) { }

    nextValue(value: number, mean?: number) {
        if (this.values.length === this.period) {
            this.values.shift();
        }

        this.values.push(value);

        if (!mean) {
            return;
        }

        return Math.sqrt(this.values.reduce((acc, item) => acc + (item - mean) ** 2, 0) / this.period);
    }
}
