import { Extremums } from './extremum';
import { HighLine, LowLine } from './line';
import { ExtremumsItem, LineId, LineEvent } from './types';

export class TrendLines {
    private lines: Array<HighLine | LowLine> = [];
    private hLine: HighLine;
    private lLine: LowLine;
    private extremumGetter: Extremums;
    private highExtremum: ExtremumsItem | null = null;
    private lowExtremum: ExtremumsItem | null = null;
    private i = 0;
    private waitNext: 'hLine' | 'lLine' = 'hLine';
    constructor() {
        this.extremumGetter = new Extremums();
    }
    //Next value
    nextValue(o: number, c: number) {
        const max = o >= c ? o : c;
        const min = o >= c ? c : o;

        // TODO: Исключить. Перенести в прямую
        this.extremumGetter.updateMax(max, this.i);
        this.extremumGetter.updateMin(min, this.i);

        // Генератор линий поддержки
        if (this.waitNext === 'hLine') {
            this.createHighLine(max);
        }

        // Генератор линий сопротивления
        if (this.waitNext === 'lLine') {
            this.createLowLine(min);
        }

        let result: number[];

        if (this.hLine) {
            const event = this.hLine.update(max, max, this.i);

            if (event === LineEvent.BREAKDOWN) {
                // Пробой, удаляем активную линию сопротивления
                this.highExtremum = null;
                this.hLine = null;
                this.waitNext = 'lLine';
                this.createLowLine(min);
            } else {
                result = [
                    this.hLine.valueAtPoint(this.i),
                    HighLine.minK * this.i +
                    (this.highExtremum.value - HighLine.minK - HighLine.minK * this.highExtremum.idx),
                    undefined,
                    undefined,
                    this.hLine.getSubtrendValue(this.i),
                    undefined,
                ];
            }
        }

        if (this.lLine) {
            const event = this.lLine.update(min, max, this.i);

            if (event === LineEvent.BREAKDOWN) {
                this.lLine = null;
                this.lowExtremum = null;
                this.waitNext = 'hLine';
                this.createHighLine(max);
            } else {
                result = [
                    undefined,
                    undefined,
                    this.lLine.valueAtPoint(this.i),
                    LowLine.minK * this.i +
                    (this.lowExtremum.value - LowLine.minK - LowLine.minK * this.lowExtremum.idx),
                    undefined,
                    this.lLine.getSubtrendValue(this.i),
                ];
            }
        }

        this.i++;

        return result;
    }

    private createHighLine(max: number): void {
        const extremum = this.extremumGetter.getMax();

        if (!extremum) {
            return;
        }

        const k = (max - extremum.value) / (this.i - extremum.idx);
        const b = max - k * this.i;

        // Начало тренда сопротивления
        if (k < HighLine.minK) {
            const line = new HighLine(k, b, extremum.idx);
            this.hLine = line;
            this.lines.push(line);
            // TODO Deprecated. Use line.startPoint, line.startIdx
            this.highExtremum = extremum;
            this.waitNext = null;
            // Начинаем искать минимальное значение за период текущего тренда
            this.extremumGetter.resetMin();
        }
    }

    private createLowLine(min: number) {
        const extremum = this.extremumGetter.getMin();

        if (!extremum) {
            return false;
        }

        //  1ая итерация, k,b - неизвестны
        const k = (min - extremum.value) / (this.i - extremum.idx);
        const b = min - k * this.i;

        // Нормальные условия линии
        if (k > LowLine.minK) {
            const line = new LowLine(k, b, extremum.idx);
            this.lLine = line;
            this.lines.push(line);
            this.lowExtremum = extremum;
            this.waitNext = null;
            this.extremumGetter.resetMax();
            return true;
        }
    }
}
