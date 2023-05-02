import { ATR } from './atr';
/**
 * SuperTrend indicator is one of the hybrid custom tools that show the current trend in the market.
 * The indicator name stands for Multi Time Frame SuperTrend.
 * The tool can show the direction of the trend on several timeframes at once.
 */
export class SuperTrend {
    private atr: ATR;
    private prevSuper: number;
    private prevUpper: number;
    private prevLower: number;
    private prevClose: number;

    constructor(
        period = 10,
        private multiplier = 3,
        smoothing: 'SMA' | 'EMA' | 'SMMA' | 'WEMA' | 'LWMA' | 'EWMA' | 'RMA' = 'WEMA',
    ) {
        this.atr = new ATR(period, smoothing);
    }

    nextValue(h: number, l: number, c: number) {
        const atr = this.atr.nextValue(h, l, c);

        if (atr) {
            const src = (h + l) / 2;
            let upper = src + this.multiplier * atr;
            let lower = src - this.multiplier * atr;

            if (this.prevLower) {
                lower = lower > this.prevLower || this.prevClose < this.prevLower ? lower : this.prevLower;
                upper = upper < this.prevUpper || this.prevClose > this.prevUpper ? upper : this.prevUpper;
            }

            let superTrend = upper;

            if (this.prevSuper === this.prevUpper) {
                superTrend = c > upper ? lower : upper;
            } else {
                superTrend = c < lower ? upper : lower;
            }

            const direction = superTrend === upper ? 1 : -1;

            this.prevUpper = upper;
            this.prevLower = lower;
            this.prevSuper = superTrend;
            this.prevClose = c;

            return { upper, lower, superTrend, direction };
        }
    }

    momentValue(h: number, l: number, c: number) {
        const atr = this.atr.momentValue(h, l);
        const src = (h + l) / 2;

        let upper = src + this.multiplier * atr;
        let lower = src - this.multiplier * atr;

        if (this.prevLower) {
            lower = lower > this.prevLower || this.prevClose < this.prevLower ? lower : this.prevLower;
            upper = upper < this.prevSuper || this.prevClose > this.prevUpper ? upper : this.prevUpper;
        }

        let superTrend = upper;

        if (this.prevSuper === this.prevUpper) {
            superTrend = c > upper ? lower : upper;
        } else {
            superTrend = c < lower ? upper : lower;
        }

        const direction = superTrend === upper ? 1 : -1;

        return { upper, lower, superTrend, direction };
    }
}
