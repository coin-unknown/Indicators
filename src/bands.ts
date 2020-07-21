import { SMA } from './sma';
import { StandardDeviationProvider } from './providers/standard-deviation';
export class BollingerBands {
    private sd: StandardDeviationProvider;
    private sma: SMA;

    /**
     * Конструктор
     * @param period - период по умолчанию 20
     * @param d - множитель отклоения по умолчанию 2
     */
    constructor(private period: number = 20, private stdDev: number = 2) {
        this.sma = new SMA(period);
        this.sd = new StandardDeviationProvider(period);
    }

    nextValue(close: number) {
        const middle = this.sma.nextValue(close);
        const sd = this.sd.nextValue(close, middle);
        const lower = middle - this.stdDev * sd;
        const upper = middle + this.stdDev * sd;

        return { lower, middle, upper };
    }
}
