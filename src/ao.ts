import { SMA } from './sma';

/**
 Awesome Oscillator (AO) is an indicator that is non-limiting oscillator,
 providing insight into the weakness or the strength of a stock.
 The Awesome Oscillator is used to measure market momentum and
 to affirm trends or to anticipate possible reversals.
 */

export class AO {
    private smaSlow: SMA;
    private smaFast: SMA;
    private smaSlowValue: number;
    private smaFastValue: number;

    constructor() {
        this.smaSlow = new SMA(34);
        this.smaFast = new SMA(5);
    }

    nextValue(high: number, low: number) {
        this.smaSlowValue = this.smaSlow.nextValue((high + low) / 2);
        this.smaFastValue = this.smaFast.nextValue((high + low) / 2);

        const difference = this.smaFastValue - this.smaSlowValue;

        return {
            ao: difference,
            smaSlowValue: this.smaSlowValue,
            smaFastValue: this.smaFastValue,
        };
    }

    momentValue(high: number, low: number) {
        const smaSlowValue = this.smaSlow.momentValue((high + low) / 2);
        const smaFastValue = this.smaFast.momentValue((high + low) / 2);

        const difference = smaFastValue - smaSlowValue;

        return {
            ao: difference,
            smaSlowValue,
            smaFastValue,
        };
    }
}
