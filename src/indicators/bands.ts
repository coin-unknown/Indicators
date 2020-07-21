import { SMA } from './sma';
import { StandardDeviationProvider } from '../providers/standard-deviation';

export class Bands {
    private prevClose: number;
    private period: number;
    private sd: StandardDeviationProvider;
    private sma: SMA;
    private d: number;

    /**
     * Конструктор
     * @param period - период по умолчанию 20
     * @param d - множитель отклоения по умолчанию 2
     */
    constructor(period: number = 20, d: number = 2) {
        this.d = d;
        this.period = period;
        this.sma = new SMA(period);
        this.sd = new StandardDeviationProvider(period);
        this.prevClose = 0;
    }

    nextValue(close: number) {
        const middle = this.sma.nextValue(close);
        const sd = this.sd.nextValue(close, middle);
        const low = middle - this.d * sd;
        const high = middle + this.d * sd;

        return { low, middle, high };
    }
}

const data = [
    1.0832,
    1.0746,
    1.078,
    1.0929,
    1.0925,
    1.0858,
    1.0857,
    1.0876,
    1.0863,
    1.0913,
    1.0894,
    1.0907,
    1.0888,
    1.0873,
    1.0797,
    1.0848,
    1.0868,
    1.0892,
    1.0939,
    1.083,
    1.0887,
    1.0918,
    1.1102,
    1.1207,
    1.1158,
];

const bands = new Bands(20, 2);

data.forEach((item) => {
    console.log(bands.nextValue(item));
});
