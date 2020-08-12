import { percentChange } from './utils';

type OHLC = { o: number; h: number; l: number; c: number };

export class Wave {
    private ohlc: OHLC[] = [];
    private min: number = null;
    private max: number = null;
    private period: number;
    private lastImage: boolean;

    /**
     * Конструктор
     * @param period - целочисленное значение от 1 до  12
     * @param period - период
     * @param lastImage - требовать наличия закрывающего движение патерна
     */
    constructor(period: number, lastImage: boolean) {
        this.period = period;
        this.lastImage = lastImage;

        if (this.lastImage) {
            this.period += 1;
        }
    }

    nextValue(open: number, high: number, low: number, close: number) {
        if (this.ohlc.length === this.period) {
            const rm = this.ohlc.shift();

            if (rm.c === this.max || rm.o === this.max) {
                this.max = null;
            }

            if (rm.c === this.min || rm.o === this.min) {
                this.min = null;
            }
        }

        this.ohlc.push({ o: open, h: high, l: low, c: close });

        if (this.ohlc.length < this.period) {
            return { p: undefined, d: undefined };
        }

        if (this.min !== null) {
            this.min = Math.min(open, close, this.min);
        } else {
            this.min = Infinity;

            for (let len = this.ohlc.length - 1, i = len; i >= 0; i--) {
                const c = this.ohlc[i];
                this.min = Math.min(c.o, c.c, this.min);
            }
        }

        if (this.max !== null) {
            this.max = Math.max(open, close, this.max);
        } else {
            this.max = -Infinity;

            for (let len = this.ohlc.length - 1, i = len; i >= 0; i--) {
                const c = this.ohlc[i];
                this.max = Math.max(c.o, c.c, this.max);
            }
        }

        let lastImage = true;
        const p = percentChange(this.max, this.min);
        const ohlc = this.ohlc.slice(0);
        let d = 0;

        if (this.lastImage) {
            const last = ohlc.pop();
            lastImage = this.isDoji(last) || this.isNoAnyShadow(last);
        }

        if (!lastImage && this.lastImage) {
            return { p: undefined, d: undefined };
        }

        if (this.isSeriesBulish(ohlc)) {
            d = 1;
        } else if (this.isSeriesBearish(ohlc)) {
            d = -1;
        }

        return { p, d };
    }

    isSeriesBulish(ohlc: OHLC[]) {
        return ohlc.every((c) => c.o < c.c);
    }

    isSeriesBearish(ohlc: OHLC[]) {
        return ohlc.every((c) => c.o > c.c);
    }

    isNoAnyShadow(ohlc: OHLC) {
        return ohlc.h === ohlc.o || ohlc.h === ohlc.c || ohlc.l === ohlc.o || ohlc.h === ohlc.o;
    }

    isDoji(ohlc: OHLC) {
        return ohlc.o === ohlc.c;
    }
}
