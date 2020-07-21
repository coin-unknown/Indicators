export class StandardDeviationProvider {
    private values: number[] = [];

    constructor(private period: number) {}

    nextValue(value: number, mean?: number) {
        if (this.values.length === this.period) {
            this.values.shift();
        }

        if (!mean) {
            return;
        }

        this.values.push(value);
        return Math.sqrt(this.values.reduce((acc, item) => acc + Math.pow(item - mean, 2)));
    }
}
