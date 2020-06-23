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
export const max = (arr: number[]) => {
    let max = -Infinity;
    for (let i = arr.length - 1; i >= 0; i--) {
        max = Math.max(max, arr[i]);
    }

    return max;
};

export const min = (arr: number[]) => {
    let min = Infinity;
    for (let i = arr.length - 1; i >= 0; i--) {
        min = Math.min(min, arr[i]);
    }

    return min;
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
