export function sum(arr: number[]) {
    let sum = 0;
    let i = arr.length;

    while (i > 0) {
        sum += arr[--i];
    }

    return sum;
}

export const percentChange = (current: number, prev: number) => ((current - prev) / prev) * 100;
export const avg = (arr: number[], period = arr.length) => sum(arr) / period || 0;
export const getMax = (arr: number[]) => {
    let max = -Infinity;
    let idx = 0;

    for (let i = arr.length - 1; i >= 0; i--) {
        const item = arr[i];

        if (max < item) {
            idx = i;
            max = item;
        }
    }

    return { max, idx };
};

export const getMin = (arr: number[]) => {
    let min = Infinity;
    let idx = 0;

    for (let i = arr.length - 1; i >= 0; i--) {
        const item = arr[i];

        if (min > item) {
            idx = i;
            min = item;
        }
    }

    return { min, idx };
};

export class AvgChangeProvider {
    private prev: number;
    private arrGain: number[] = [];
    private arrLoss: number[] = [];
    public gain: number;
    public loss: number;

    constructor(private period: number) {}

    nextValue(value: number) {
        if (this.prev === undefined) {
            this.prev = value;
            return;
        }

        if (this.arrGain.length === this.period) {
            this.arrGain.shift();
            this.arrLoss.shift();
        }

        const change = value - this.prev;
        const isPositive = change > 0;
        const gain = isPositive ? change : 0;
        const loss = !isPositive ? Math.abs(change) : 0;

        this.prev = value;

        if (this.gain || this.loss) {
            this.gain = (this.gain * (this.period - 1) + gain) / this.period;
            this.loss = (this.loss * (this.period - 1) + loss) / this.period;
        } else {
            this.arrGain.push(gain);
            this.arrLoss.push(loss);

            if (this.arrGain.length < this.period) {
                return { gain: undefined, loss: undefined };
            }

            this.gain = avg(this.arrGain, this.period);
            this.loss = avg(this.arrLoss, this.period);
        }

        return { gain: this.gain, loss: this.loss };
    }
}

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
            return this.prevAvg = avg(this.values, this.period);
        }
    }
}
export class MeanDeviationProvider {
    private values: number[] = [];
    private prevResult: number;

    constructor(private period: number) { }

    nextValue(typicalPrice: number, average?: number) {
        if (this.values.length === this.period) {
            this.values.shift();
        }

        this.values.push(typicalPrice);
        this.prevResult = this.values.reduce((acc, value) => acc + Math.abs(average - value), 0);

        return average && (this.prevResult / this.period);
    }
}
