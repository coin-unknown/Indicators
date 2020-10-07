import { AvgProvider } from './providers/aerage-deviation';

export class ATR {
    private prevClose: number;
    private avg: AvgProvider;

    /**
     * Конструктор
     * @param period - период по умолчанию 14
     */
    constructor(period = 14) {
        this.avg = new AvgProvider(period);
        this.prevClose = 0;
    }

    nextValue(high: number, low: number, close: number) {
        const prevClose = this.prevClose;
        this.prevClose = close;

        if (prevClose) {
            const trueRange = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));

            return this.avg.nextValue(trueRange);
        }
    }

    momentValue(high: number, low: number) {
        const prevClose = this.prevClose;

        if (prevClose) {
            const trueRange = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));

            return this.avg.momentValue(trueRange);
        }
    }
}
