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
        let lowest = 0;
        let highest = 0;

        for (let i = 0; i < values.length; i++) {
            if (values[i] < n) {
                lowest += 1;
            } else if (values[i] === n) {
                highest += 1;
            } else {
            }
        }

        const pct = (lowest + 0.5 * highest) / this.period;

        return pct;
    }
}
