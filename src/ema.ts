import { SMA } from './sma';

export class EMA {
    private arr: number[] = [];
    private sma: SMA;

    constructor(private period: number) {
        this.sma = new SMA(period);
    }

    nextValue(value: number) {
        if (this.arr.length === this.period) {
            this.arr.shift();
        }

        this.arr.push(value);
        let ema = this.sma.nextValue(value);

        if (!ema) {
            return;
        }

        const c = smooth(this.period);

        for (let i = this.period; i < this.arr.length; i++) {
            ema = c * this.arr[i] + (1 - c) * ema;
        }

        return ema;
    }
}

function smooth(n: number) {
    return 2 / (n + 1);
}
