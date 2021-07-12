import { SMMA } from '../smma';

export class AvgChangeProvider {
    private avgGain: SMMA;
    private avgLoss: SMMA;
    private prev: number;

    constructor(period: number) {
        this.avgGain = new SMMA(period);
        this.avgLoss = new SMMA(period);
    }

    nextValue(value: number) {
        const change = value - this.prev;

        if (!this.prev) {
            this.prev = value;
            return;
        }

        const isPositive = change > 0;
        const isNegative = change < 0;
        const localGain = isPositive ? change : 0;
        const localLoss = isNegative ? change : 0;
        const upAvg = this.avgGain.nextValue(localGain);
        const downAvg = this.avgLoss.nextValue(localLoss);

        this.prev = value;

        return { upAvg, downAvg };
    }

    momentValue(value: number) {
        const change = value - this.prev;
        const isPositive = change > 0;
        const isNegative = change < 0;
        const localGain = isPositive ? change : 0;
        const localLoss = isNegative ? change : 0;
        const upAvg = this.avgGain.momentValue(localGain);
        const downAvg = this.avgLoss.momentValue(localLoss);

        return { upAvg, downAvg };
    }
}
