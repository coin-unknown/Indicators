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

    momentValue(value: number) {
        let prevAvg = this.prevAvg;

        if (prevAvg) {
            prevAvg = (prevAvg * (this.period - 1) + value) / this.period;
            return prevAvg;
        }

        const values = this.values.slice(0);

        values.push(value);

        if (values.length === this.period) {
            return (prevAvg = avg(values, this.period));
        }
    }
}
