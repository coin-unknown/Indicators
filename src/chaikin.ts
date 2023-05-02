import { EMA } from './ema';

/**
 * Developed by Marc Chaikin, the Chaikin Oscillator measures the momentum of the Accumulation Distribution Line
 * using the MACD formula. (This makes it an indicator of an indicator.) The Chaikin Oscillator
 * is the difference between the 3-day and 10-day EMAs of the Accumulation Distribution Line.
 * Like other momentum indicators, this indicator is designed to anticipate directional changes
 * in the Accumulation Distribution Line by measuring the momentum behind the movements.
 * A momentum change is the first step to a trend change.
 * Anticipating trend changes in the Accumulation Distribution Line can help chartists anticipate
 * trend changes in the underlying security. The Chaikin Oscillator generates signals with
 * crosses above/below the zero line or with bullish/bearish divergences.
 */
export class ChaikinOscillator {
    private accDistribution = 0;
    private emaFast: EMA;
    private emaSlow: EMA;

    constructor(fastPeriod: number = 3, slowPeriod: number = 10) {
        this.emaFast = new EMA(fastPeriod);
        this.emaSlow = new EMA(slowPeriod);
    }

    nextValue(h: number, l: number, c: number, v: number) {
        this.accDistribution += (c === h && c === l) || h === l ? 0 : ((2 * c - l - h) / (h - l)) * v;

        return this.emaFast.nextValue(this.accDistribution) - this.emaSlow.nextValue(this.accDistribution);
    }

    momentValue(h: number, l: number, c: number, v: number) {
        const accDistribution =
            this.accDistribution + ((c === h && c === l) || h === l ? 0 : ((2 * c - l - h) / (h - l)) * v);

        return this.emaFast.momentValue(accDistribution) - this.emaSlow.momentValue(accDistribution);
    }
}
