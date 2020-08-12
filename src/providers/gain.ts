import { avg } from '../utils';

export class AvgChangeProvider {
    private arrGain: number[] = [];
    private arrLoss: number[] = [];
    private prev: number;
    public gain: number;
    public loss: number;

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

        if (arrGain.length === this.period) {
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

            if (arrGain.length < this.period) {
                return { gain: undefined, loss: undefined, prev };
            }

            gain = avg(arrGain, this.period);
            loss = avg(arrLoss, this.period);
        }

        return { gain, loss, prev };
    }
}
