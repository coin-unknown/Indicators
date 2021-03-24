import { EMA } from './ema';

/*
How work MACD?
https://www.investopedia.com/terms/m/macd.asp#:~:text=The%20MACD%20is%20calculated%20by,for%20buy%20and%20sell%20signals.
*/

export class MACD {
    private emaFastIndicator: EMA;
    private emaSlowIndicator: EMA;
    private emaFast: number;
    private emaSlow: number;
    private macd: number;

    constructor(private periodEmaFast: number, private periodEmaSlow: number) {
        this.emaFastIndicator = new EMA(periodEmaFast);
        this.emaSlowIndicator = new EMA(periodEmaSlow);
    }

    nextValue(value: number) {
        this.emaFast = this.emaFastIndicator.nextValue(value);
        this.emaSlow = this.emaSlowIndicator.nextValue(value);
        this.macd = this.emaFast - this.emaSlow;
        return {
            macd: this.macd,
            emaFast : this.emaFast,
            emaSlow: this.emaSlow
        }
    }
}