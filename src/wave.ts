import { percentChange } from './utils';

type OHLC = { o: number; h: number; l: number; c: number };

export class Wave {
    private bearishStreak = 0;
    private bullishStreak = 0;
    private consolidate = 0;
    private prevBearDiff = 0;
    private prevBullDiff = 0;

    /**
     * Конструктор
     */
    constructor() {}

    nextValue(open: number, close: number) {
        // bullish
        if (open < close) {
            this.bullishStreak++;

            const diff = close - open;

            if (this.prevBearDiff) {
                this.consolidate = 0;
            }

            if (this.prevBullDiff > diff) {
                this.consolidate++;
            }

            this.prevBullDiff = diff;;
            this.prevBearDiff = 0;
            this.bearishStreak = 0;
        }

        // bearish
        if (open > close) {
            this.bearishStreak++;
            const diff = open - close;

            if (this.prevBullDiff) {
                this.consolidate = 0;
            }

            if (this.prevBearDiff > diff) {
                this.consolidate++;
            }

            this.prevBearDiff = diff;
            this.prevBullDiff = 0;
            this.bullishStreak = 0;
        }

        // doji is neutral
        if (open === close) {
            this.bearishStreak++;
            this.bullishStreak++;
            this.prevBearDiff = this.prevBullDiff = 0;
        }

        return { up: this.bullishStreak, down: this.bearishStreak, consolidate: this.consolidate };
    }

    isBulish(tick: OHLC) {
        return tick.o < tick.c;
    }

    isBearish(tick: OHLC) {
        return tick.o > tick.c;
    }

    isNoAnyShadow(ohlc: OHLC) {
        return ohlc.h === ohlc.o || ohlc.h === ohlc.c || ohlc.l === ohlc.o || ohlc.h === ohlc.o;
    }

    isDoji(ohlc: OHLC) {
        return ohlc.o === ohlc.c;
    }
}
