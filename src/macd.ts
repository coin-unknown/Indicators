import { EMA } from './ema';

/*
How work MACD?
https://www.investopedia.com/terms/m/macd.asp#:~:text=The%20MACD%20is%20calculated%20by,for%20buy%20and%20sell%20signals.
*/

export class MACD {
    private emaFastIndicator: EMA;
    private emaSlowIndicator: EMA;
    private emaSignalIndicator: EMA;
    private emaFast: number;
    private emaSlow: number;
    private signal: number;
    private macd: number;
    private histogram: number;

    constructor(private periodEmaFast = 12, private periodEmaSlow = 26, private periodSignal = 9) {
        this.emaFastIndicator = new EMA(periodEmaFast);
        this.emaSlowIndicator = new EMA(periodEmaSlow);
        this.emaSignalIndicator = new EMA(periodSignal);
    }

    nextValue(value: number) {
        this.emaFast = this.emaFastIndicator.nextValue(value);
        this.emaSlow = this.emaSlowIndicator.nextValue(value);
        this.macd = this.emaFast - this.emaSlow;
        this.signal = this.emaSignalIndicator.nextValue(this.macd);
        this.histogram = this.macd - this.signal;
        return {
            macd: this.macd,
            emaFast: this.emaFast,
            emaSlow: this.emaSlow,
            signal: this.signal,
            histogram: this.histogram,
        };
    }
}
