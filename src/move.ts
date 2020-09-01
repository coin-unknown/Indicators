import { percentChange } from './utils';

export class Move {
    private prices: number[] = [];
    private period: number;
    private min: number;
    private max: number;

    /**
     * Конструктор
     * @param period - целочисленное значение от 1 до  12
     * @param period - период
     */
    constructor(period: number) {
        this.period = period;
    }

    nextValue(close: number) {
        const { min, max, move } = this.calculate(close, this.prices, this.min, this.max);

        this.min = min;
        this.max = max;

        return move;
    }

    momentValue(close: number) {
        const { move } = this.calculate(close, this.prices.slice(0), this.min, this.max);

        return move;
    }

    calculate(close: number, prices: number[], min: number, max: number) {
        let removed: number;

        if (prices.length === this.period) {
            removed = prices.shift();
        }

        prices.push(close);

        if (prices.length < this.period) {
            return {};
        }

        if (close > max || !max) {
            max = close;
        }

        if (min < close || !min) {
            min = close;
        }

        if (removed === max) {
            max = Math.max(...prices);
        } else if (removed == min) {
            min = Math.min(...prices);
        }

       return { min, max, move: percentChange(max, min) };
    }
}
