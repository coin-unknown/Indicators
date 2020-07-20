import { SMA } from './sma';
import { MeanDeviationProvider } from './utils';
import { CCI as CCI2 } from 'technicalindicators';

export class CCI {
    private md: MeanDeviationProvider;
    private sma: SMA;

    /**
     * Конструктор
     * @param period - период по умолчанию 20
     */
    constructor(period: number = 20) {
        this.md = new MeanDeviationProvider(period);
        this.sma = new SMA(period);
    }

    nextValue(high: number, low: number, close: number) {
        const typicalPrice = (high + low + close) / 3;
        const average = this.sma.nextValue(typicalPrice);
        const meanDeviation = this.md.nextValue(typicalPrice, average);

        return meanDeviation && (typicalPrice - average) / (0.015 * meanDeviation);
    }
}
