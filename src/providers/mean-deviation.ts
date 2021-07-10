import { CircularBuffer } from './ring-buffer';
export class MeanDeviationProvider {
    private values: CircularBuffer;

    constructor(private period: number) {
        this.values = new CircularBuffer(period);
    }

    nextValue(typicalPrice: number, average?: number) {
        this.values.push(typicalPrice);

        const mean = this.values.toArray().reduce((acc, value) => acc + Math.abs(average - value), 0);

        return average && mean / this.period;
    }

    momentValue(typicalPrice: number, average?: number) {
        const rm = this.values.push(typicalPrice);
        const mean = this.values.toArray().reduce((acc, value) => acc + Math.abs(average - value), 0);

        this.values.pushback(rm);

        return average && mean / this.period;
    }
}
