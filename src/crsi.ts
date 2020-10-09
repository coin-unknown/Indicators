import { PercentRank } from './providers/percent-rank';
import { ROC } from './roc';
import { RSI } from './rsi';

/**
 * Connors RSI (CRSI) uses the above formula to generate a value between 0 and 100.
 * This is primarily used to identify overbought and oversold levels.
 * Connor's original definition of these levels is that a value over 90
 * should be considered overbought and a value under 10 should be considered oversold.
 * On occasion, signals occur during slight corrections during a trend. For example,
 * when the market is in an uptrend, Connors RSI might generate short term sell signals.
 * When the market is in a downtrend, Connors RSI might generate short term buy signals.
 */
export class cRSI {
    private rsi: RSI;
    private streakRsi: RSI;
    private prevClose: number;
    private streakLength: number;
    private streakValue: number;
    private roc: ROC;
    private prnk: PercentRank;

    constructor(private period = 3, streakPeriod = 2, prnkPeriod = 100) {
        this.rsi = new RSI(this.period);
        this.streakRsi = new RSI(streakPeriod);
        this.roc = new ROC(1);
        this.prnk = new PercentRank(prnkPeriod);
        this.streakLength = 0;
        this.prevClose = 0;
    }

    nextValue(value: number) {
        const rsi = this.rsi.nextValue(value);
        const prnk = this.prnk.nextValue(this.roc.nextValue(value));

        this.updateStreak(value);
        this.prevClose = value;

        if (this.streakValue === undefined) {
            return;
        }

        return (rsi + this.streakValue + prnk) / 3;
    }

    momentValue(value: number) {
        const rsi = this.rsi.momentValue(value);
        const prnk = this.prnk.momentValue(this.roc.momentValue(value));

        if (this.streakValue === undefined) {
            return;
        }

        return (rsi + this.streakValue + prnk) / 3;
    }

    private updateStreak(value: number) {
        if (value > this.prevClose) {
            // reset negative streak
            if (this.streakLength < 0) {
                this.streakLength = 0;
            }

            this.streakLength++;
        } else if (value < this.prevClose) {
            // reset positive streak
            if (this.streakLength > 0) {
                this.streakLength = 0;
            }

            this.streakLength--;
        } else {
            this.streakLength = 0;
        }

        const res = this.streakRsi.nextValue(this.streakLength);

        if (!isNaN(res)) {
            this.streakValue = res;
        }
    }
}
