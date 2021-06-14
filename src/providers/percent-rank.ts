/**
 * Returns the percentile of a value. Returns the same values as the Excel PERCENTRANK and PERCENTRANK.INC functions.
 */
export class PercentRank {
    private values: number[] = [];

    constructor(private period: number) {}

    public nextValue(value: number) {
        const res = this.calculate(this.values, value);

        if (this.values.length === this.period) {
            this.values.shift();
        }

        this.values.push(value);

        return res;
    }

    public momentValue(value: number) {
        const res = this.calculate(this.values.slice(0), value);

        return res;
    }

    private calculate(values: number[], n: number) {
        let count = 0;

        values.forEach((value) => {
            if (value <= n) count++;
        });

        return (count / this.period) * 100;
    }
}
