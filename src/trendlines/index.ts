import { Extremums } from '../providers/extremum';
import { HighLine, LowLine } from './line';
import { ExtremumsItem, LineId, LineEvent } from './types';

export class TrendLines {
    private turningPoints = [];
    private lines: Array<HighLine | LowLine> = [];
    private hLine: HighLine;
    private lLine: LowLine;
    private highExtremumGetter: Extremums;
    private lowExtremumGetter: Extremums;
    private highExtremums: ExtremumsItem[] = [];
    private lowExtremums: ExtremumsItem[] = [];
    private highExtremum: ExtremumsItem | null = null;
    private lowExtremum: ExtremumsItem | null = null;
    private i = 0;
    private breakCounter = 0;
    constructor() {
        this.highExtremumGetter = new Extremums('max');
        this.lowExtremumGetter = new Extremums('min');
    }

    nextValue(o: number, c: number) {
        const max = o >= c ? o : c;
        const min = o >= c ? c : o;
        const hExtremum = this.highExtremumGetter.nextValue(max);
        const lExtremum = this.lowExtremumGetter.nextValue(max);

        if (hExtremum) {
            const extremumPoint = { idx: this.i - 1, value: hExtremum };

            this.highExtremums.push(extremumPoint);

            // Условия переопределения экстремума
            if (!this.highExtremum) {
                this.highExtremum = extremumPoint;
            }
        }

        if (lExtremum) {
            const extremumPoint = { idx: this.i - 1, value: lExtremum };

            this.lowExtremums.push(extremumPoint);
        }

        let result: number[];

        if (this.highExtremum) {
            result = this.produceHigh(max);
        }

        // Условия переопределения экстремума
        if (this.breakCounter >= 6 && !this.lowExtremum) {
            this.lowExtremum = this.lowExtremums.slice(-1)[0];
        }

        if (this.lowExtremum) {
            result = (result || []).concat(this.produceLow(min));
        }

        this.i++;

        return result;
    }

    private produceHigh(max: number) {
        // Строим первую линию
        // Высчитываем прямую k, b
        // const prevPoint = array[i - 1];
        let breakdown = 0;
        //  1ая итерация, k,b - неизвестны
        if (!this.hLine) {
            const k = (max - this.highExtremum.value) / (this.i - this.highExtremum.idx);
            const b = max - k * this.i;

            // Нормальные условия линии
            if (k < HighLine.minK) {
                const line = new HighLine(k, b, this.i);
                this.hLine = line;
                this.lines.push(line);
            } else {
                return;
            }
        }

        const hEvent = this.hLine.update(max, this.i, this.highExtremum);

        if (hEvent === LineEvent.BREAKDOWN) {
            breakdown = 1;
            this.breakCounter++;
        }

        return [
            this.hLine.valueAtPoint(this.i),
            HighLine.minK * this.i + (this.highExtremum.value - HighLine.minK - HighLine.minK * this.highExtremum.idx),
            breakdown,
        ];
    }

    produceLow(min: number) {
        if (!this.lLine) {
            const k = (min - this.lowExtremum.value) / (this.i - this.lowExtremum.idx);
            const b = min - k * this.i;

            // Нормальные условия линии
            if (k > LowLine.minK) {
                const line = new LowLine(k, b, this.i);
                this.lLine = line;
                this.lines.push(line);
            } else {
                return;
            }
        }

        const event = this.lLine.update(min, this.i, this.lowExtremum);

        if (event === LineEvent.BREAKDOWN) {
            // breakdown = 1;
            // this.breakCounter++;
        }

        return [
            this.lLine.valueAtPoint(this.i),
            LowLine.minK * this.i + (this.lowExtremum.value - LowLine.minK - LowLine.minK * this.lowExtremum.idx),
        ];
    }
}
