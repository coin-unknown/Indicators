export class MeanDeviationProvider {
    private values: number[] = [];

    constructor(private period: number) {}

    nextValue(typicalPrice: number, average?: number) {
        return this.calculate(this.values, typicalPrice, average);
    }

    momentValue(typicalPrice: number, average?: number) {
        return this.calculate(this.values.slice(0), typicalPrice, average);
    }

    calculate(values: number[], typicalPrice: number, average?: number) {
        if (values.length === this.period) {
            values.shift();
        }

        values.push(typicalPrice);
        const mean = values.reduce((acc, value) => acc + Math.abs(average - value), 0);

        return average && mean / this.period;
    }
}
