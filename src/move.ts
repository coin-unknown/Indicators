import { percentChange } from './utils';
import { CircularBuffer } from './providers/circular-buffer';

export class Move {
    private changes: CircularBuffer;
    private prevPrice: number;
    private value = 0;

    /**
     * Конструктор
     * @param period - целочисленное значение от 1 до  12
     * @param period - период
     */
    constructor(private period: number) {
        this.changes = new CircularBuffer(period);
    }

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
        this.value += change;
        this.value -= this.changes.push(change);

        return this.value;
    }
}
