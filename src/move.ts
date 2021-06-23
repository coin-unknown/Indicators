import { percentChange } from './utils';

export class Move {
    private changes: number[] = [];
    private prevPrice: number;
    private value = 0;

    /**
     * Конструктор
     * @param period - целочисленное значение от 1 до  12
     * @param period - период
     */
    constructor(private period: number) {}

    nextValue(close: number) {
        if (this.prevPrice) {
            const change = percentChange(close, this.prevPrice);
            this.calculate(change);
            this.prevPrice = close;

            return this.value;
        }

        this.prevPrice = close;
    }

    calculate(change: number) {
        if (this.changes.length >= this.period) {
            const rm = this.changes.shift();
            this.value -= rm;
        }

        this.value += change;
        this.changes.push(change);

        return this.value;
    }
}
