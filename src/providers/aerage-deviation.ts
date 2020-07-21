import { avg } from "../utils";

export class AvgProvider {
    private values: number[] = [];
    private prevAvg: number;

    constructor(private period: number) {}

    nextValue(value: number) {
        if (this.prevAvg) {
            this.prevAvg = (this.prevAvg * (this.period - 1) + value) / this.period;
            return this.prevAvg;
        }

        this.values.push(value);

        if (this.values.length === this.period) {
            return (this.prevAvg = avg(this.values, this.period));
        }
    }
}
