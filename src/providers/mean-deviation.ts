import { CircularBuffer } from './circular-buffer';
export class MeanDeviationProvider {
    private values: CircularBuffer;

    constructor(private period: number) {
        this.values = new CircularBuffer(period);
    }

    nextValue(typicalPrice: number, average?: number) {
        if (!average) {
            this.values.push(typicalPrice);
            return void 0;
        }

        this.nextValue = this.pureNextValue;
        this.momentValue = this.pureMomentValue;

        return this.pureNextValue(typicalPrice, average);
    }

    momentValue(typicalPrice: number, average?: number) {
        return void 0;
    }

    private pureNextValue(typicalPrice: number, average: number) {
        this.values.push(typicalPrice);

        return this.values.toArray().reduce((acc, value) => acc + this.positiveDelta(average, value), 0) / this.period;
    }

    private pureMomentValue(typicalPrice: number, average: number) {
        const rm = this.values.push(typicalPrice);
        const mean = this.values.toArray().reduce((acc, value) => acc + this.positiveDelta(average, value), 0);

        this.values.pushback(rm);

        return mean / this.period;
    }

    private positiveDelta(a: number, b: number) {
        return a > b ? a - b : b - a;
    }
}
