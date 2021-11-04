import { CircularBuffer } from '../providers/circular-buffer';
import { ExtremumsItem } from './types';

/**
 * TODO
 * Здесь нам нужно делать оценку ситуации, опираясь на динамику экстремумов.
 * Различаем state:
 * 1. flat. (lastmax-lastmin) < flatSize
 * 2. steadyFlat. ((lastmax-lastmin) < flatSize && (prelastmax-prelastmin) < flatSize)
 * 3. rizing. (prelastmax < lastmax && prelastmin < lastmin)
 * 4. break ((prelastmax - prelastmin) << (prelastmax - prelastmin)).
 * 4. squeez. (prelastmax < lastmax && prelastmim > lastmin). TODO obtain a squeez point.
 * 4. unstable. (prelastmax > lastmax && prelastmim > lastmin).
 * 5. falling. (prelastmin > lastmax)
 * 6. fastFalling. (prelastmin >> lastmax)
 * Экстремумы стоит смотреть не только по 3 точкам, но и по 5 точкам, чтобы
 * исключить однократные выбросы.
 * Тенденцию максимумов можно прогнозировать:
 * 1. breakUp || unstable. ((lastmax - lastmin) << (cur-lastmax))
 * 2. breakDown || unstable ((lastmax - lastmin) >> (cur - lastmin))
 * 3. squizeBreakUp
 * 4. squizeBreakDown
 * 5. PushSize - breakUp - lastmax
 */

export class Extremums {
    private maxValues: CircularBuffer;
    private minValues: CircularBuffer;
    private max: ExtremumsItem;
    private min: ExtremumsItem;

    constructor() {
        this.maxValues = new CircularBuffer(3);
        this.minValues = new CircularBuffer(3);
    }
    /**
     * Обновлет данные максимум на текущем отрезке времени
     * @param value - Max value from open | close
     * @param idx - Текущая координата времени
     * @return - true если произошло обновление величины
     */
    public updateMax(value: number, idx: number): boolean {
        this.maxValues.push(value);

        const first = this.maxValues.get(0);
        const middle = this.maxValues.get(1);
        const last = value;

        if (this.maxComporator(first, middle, last) && (!this.max || this.max.value < middle)) {
            // ид середины на 1 меньше текущего
            this.max = { value: middle, idx: --idx };
            return true;
        }
    }
    /**
     * Обновлет данные минимум на текущем отрезке времени
     * @param value - Min value from open | close
     * @param idx - Текущая координата времени
     * @return - true если произошло обновление величины
     */
    public updateMin(value: number, idx: number) {
        this.minValues.push(value);

        const first = this.minValues.get(0);
        const middle = this.minValues.get(1);
        const last = value;

        if (this.minComporator(first, middle, last) && (!this.min || this.min.value > middle)) {
            // ид середины на 1 меньше текущего
            this.min = { value: middle, idx: --idx };
            return true;
        }
    }

    public getMax() {
        return this.max;
    }

    public getMin() {
        return this.min;
    }

    public resetMax() {
        this.max = null;
    }

    public resetMin() {
        this.min = null;
    }

    private maxComporator(a: number, b: number, c: number) {
        if (a <= b && b >= c) {
            return true;
        }

        return false;
    }

    private minComporator(a: number, b: number, c: number) {
        if (a >= b && b <= c) {
            return true;
        }

        return false;
    }
}
