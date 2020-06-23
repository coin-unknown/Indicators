import { AvgChangeProvider } from './utils';

export class RSI {
    private change: AvgChangeProvider;

    constructor(private period: number) {
        this.change = new AvgChangeProvider(this.period);
    }

    nextValue(value: number) {
        const { loss: downAvg, gain: upAvg } = this.change.nextValue(value) || {};

        if (upAvg === undefined || downAvg === undefined) {
            return;
        }

        // Для начала подсчитаем через MA просто
        const RS = upAvg / downAvg;

        return 100 - 100 / (1 + RS);
    }
}
