import { ATR } from './atr';
import { CCI } from './cci';
/**
 * The MTF SuperTrend indicator is one of the hybrid custom tools that show the current trend in the market.
 * The indicator name stands for Multi Time Frame SuperTrend.
 * The tool can show the direction of the trend on several timeframes at once.
 */
export class SuperTrend {
    private cci: CCI;
    private atr: ATR;

    /**
     * @param cciPeriod recomended 50
     * @param atrPeriod recommended 5
     */
    constructor(cciPeriod = 50, atrPeriod = 5) {
        this.atr = new ATR(atrPeriod);
        this.cci = new CCI(cciPeriod);
    }

    nextValue(h: number, l: number, c: number) {
        const cci = this.cci.nextValue(h, l, c);
        const atr = this.atr.nextValue(h, l, c);

        if (cci !== undefined) {
            this.nextValue = (h: number, l: number, c: number) => {
                const cci = this.cci.nextValue(h, l, c);
                const atr = this.atr.nextValue(h, l, c);

                return cci > 0 ? h + atr : l - atr;
            };

            return cci > 0 ? h + atr : l - atr;
        }
    }

    momentValue(h: number, l: number, c: number) {
        const cci = this.cci.momentValue(h, l, c);
        const atr = this.atr.momentValue(h, l);

        return cci > 0 ? h + atr : l - atr;
    }
}
