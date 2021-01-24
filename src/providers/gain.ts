import { avg } from '../utils';

export class AvgChangeProvider {
    public gain: number;
    public loss: number;
    private arrGain: number[] = [];
    private arrLoss: number[] = [];
    private prev: number;
    private filled = false;

    constructor(private period: number) {}

    nextValue(value: number) {
        const { prev, gain, loss } = this.calculate(value, this.prev, this.arrGain, this.arrLoss, this.gain, this.loss);

        this.prev = prev;
        this.gain = gain;
        this.loss = loss;

        return { gain: this.gain, loss: this.loss };
    }

    momentValue(value: number) {
        const arrGain = this.arrGain.slice(0);
        const arrLoss = this.arrLoss.slice(0);

        const { gain, loss } = this.calculate(value, this.prev, arrGain, arrLoss, this.gain, this.loss);

        return { gain, loss };
    }

    calculate(value: number, prev: number, arrGain: number[], arrLoss: number[], gain: number, loss: number) {
        if (prev === undefined) {
            prev = value;
            return { gain: undefined, loss: undefined, prev: value };
        }

        this.filled = this.filled || arrGain.length === this.period;

        if (this.filled) {
            arrGain.shift();
            arrLoss.shift();
        }

        const change = value - prev;
        const isPositive = change > 0;
        const localGain = isPositive ? change : 0;
        const localLoss = !isPositive ? Math.abs(change) : 0;

        prev = value;

        if (gain || loss) {
            gain = (gain * (this.period - 1) + localGain) / this.period;
            loss = (loss * (this.period - 1) + localLoss) / this.period;
        } else {
            arrGain.push(localGain);
            arrLoss.push(localLoss);

            if (!this.filled) {
                return;
            }

            gain = avg(arrGain, this.period);
            loss = avg(arrLoss, this.period);
        }

        return { gain, loss, prev };
    }
}
