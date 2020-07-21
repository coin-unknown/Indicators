export class MeanDeviationProvider {
    private values: number[] = [];
    private prevResult: number;

    constructor(private period: number) {}

    nextValue(typicalPrice: number, average?: number) {
        if (this.values.length === this.period) {
            this.values.shift();
        }

        this.values.push(typicalPrice);
        this.prevResult = this.values.reduce((acc, value) => acc + Math.abs(average - value), 0);

        return average && this.prevResult / this.period;
    }
}
