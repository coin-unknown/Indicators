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

    constructor(fastPeriod = 5, slowPeriod = 34) {
        this.smaSlow = new SMA(slowPeriod);
        this.smaFast = new SMA(fastPeriod);
    }

    nextValue(high: number, low: number) {
        this.smaSlowValue = this.smaSlow.nextValue((high + low) / 2);
        this.smaFastValue = this.smaFast.nextValue((high + low) / 2);

        if (typeof this.smaSlowValue !== 'number' || typeof this.smaFastValue !== 'number') {
            return;
        }

        return this.smaFastValue - this.smaSlowValue;
    }

    momentValue(high: number, low: number) {
        const smaSlowValue = this.smaSlow.momentValue((high + low) / 2);
        const smaFastValue = this.smaFast.momentValue((high + low) / 2);

        if (typeof smaSlowValue !== 'number' || typeof smaFastValue !== 'number') {
            return;
        }

        return smaFastValue - smaSlowValue;
    }
}
