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
        const { p, d, min, max } = this.calculate(close, this.prices, this.min, this.max);

        this.min = min;
        this.max = max;

        return { p, d };
    }

    momentValue(close: number) {
        const { p, d } = this.calculate(close, this.prices.slice(0), this.min, this.max);

        return { p, d };
    }

    calculate(close: number, prices: number[], min: number, max: number) {
        if (prices.length === this.period) {
            const rm = prices.shift();

            if (rm === max) {
                max = null;
            }

            if (rm === min) {
                min = null;
            }
        }

        prices.push(close);

        if (prices.length < this.period) {
            return { p: undefined, d: undefined, min, max };
        }

        if (min !== null) {
            min = Math.min(close, min);
        } else {
            min = Infinity;

            for (let len = prices.length - 1, i = len; i >= 0; i--) {
                const c = prices[i];
                min = Math.min(c, min);
            }
        }

        if (max !== null) {
            max = Math.max(close, max);
        } else {
            max = -Infinity;

            for (let len = prices.length - 1, i = len; i >= 0; i--) {
                const c = prices[i];
                max = Math.max(c, max);
            }
        }

        const p = percentChange(max, min);
        const lastPrice = prices[this.period - 1];

        let d = 0;

        if (lastPrice === this.max) {
            d = 1;
        } else if (lastPrice === this.min) {
            d = -1;
        }

        return { p, d, min, max };
    }
}
