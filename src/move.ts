import { percentChange } from './utils';

export class Move {
    private prices: number[] = [];
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
        return this.calculate(close, this.prices);
    }

    momentValue(close: number) {
        return this.calculate(close, this.prices.slice(0));
    }

    calculate(close: number, prices: number[]) {
        if (prices.length === this.period) {
            prices.shift();
        }

        prices.push(close);

        const start = prices[0];

        if (prices.length < this.period) {
            return;
        }

       return percentChange(close, start);
    }
}
