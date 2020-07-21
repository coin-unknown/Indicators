import { avg } from '../utils';

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
