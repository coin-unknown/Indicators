import { percentChange } from './utils';

export class Move {
    private prices: number[] = [];
    private min: number = null;
    private max: number = null;
    private period: number;

    /**
     * Конструктор
     * @param period - целочисленное значение от 1 до  12
     * @param period - период
     */
    constructor(period: number) {
        this.period = period;
    }

    nextValue(close: number) {
        if (this.prices.length === this.period) {
            const rm = this.prices.shift();

            if (rm === this.max) {
                this.max = null;
            }

            if (rm === this.min) {
                this.min = null;
            }
        }

        this.prices.push(close);

        if (this.prices.length < this.period) {
            return { p: undefined, d: undefined };
        }

        if (this.min !== null) {
            this.min = Math.min(close, this.min);
        } else {
            this.min = Infinity;

            for (let len = this.prices.length - 1, i = len; i >= 0; i--) {
                const c = this.prices[i];
                this.min = Math.min(c, this.min);
            }
        }

        if (this.max !== null) {
            this.max = Math.max(close, this.max);
        } else {
            this.max = -Infinity;

            for (let len = this.prices.length - 1, i = len; i >= 0; i--) {
                const c = this.prices[i];
                this.max = Math.max(c, this.max);
            }
        }

        const p = percentChange(this.max, this.min);
        const lastPrice = this.prices[this.period - 1];

        let d = 0;

        if (lastPrice === this.max) {
            d = 1;
        } else if (lastPrice === this.min) {
            d = -1;
        }

        return { p, d };
    }
}
