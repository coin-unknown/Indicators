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
    private tLines: LineModel[]
    private step: number = 1
    constructor() {
        this.extremumGetter = new Extremums();
    }
    //Next value
    nextValue(o: number, c: number, h: number, l: number) {
        //New model. Отличия:
        //Анализ по h/l, а не по max/min
        //Поиск ускорений после потенциального отскока
        //Одновременный поиск трендов сверху и снизу
        const max = h; //o >= c ? o : c;
        const min = l; //o >= c ? c : o;
        //init tLines
        if (!this.tLines) {
            //TODO Load i from candels data
            let tLine = new LineModel(h, null, this.i, this.step)
            this.tLines.push(tLine)
            tLine = new LineModel(null, l, this.i, this.step)
            this.tLines.push(tLine)
        }
        this.tLines.forEach(tline => tline.update(h, l, this.i))

        // Old model

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
        // Обновляем тренд сопротивления
        if (this.hLine) {
            const event = this.hLine.update(min, max, this.i);

            if (event === LineEvent.BREAKDOWN) {
                // Пробой, удаляем активную линию сопротивления
                this.highExtremum = null;
                this.hLine = null;
                this.waitNext = 'lLine';
                this.createLowLine(min);
            } else {
                result = [
                    // Current line value
                    this.hLine.valueAtPoint(this.i),
                    //Poor line value
                    HighLine.minK * this.i +
                    (this.highExtremum.value - HighLine.minK - HighLine.minK * this.highExtremum.idx),
                    undefined,
                    undefined,
                    this.hLine.getSubtrendValue(this.i),
                    undefined,
                ];
            }
        }
        // Обновляем тренд поддержки
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
                    // Current line value
                    this.lLine.valueAtPoint(this.i),
                    // Poor line value
                    LowLine.minK * this.i +
                    (this.lowExtremum.value - LowLine.minK - LowLine.minK * this.lowExtremum.idx),
                    undefined,
                    // Subtrend for lLine
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

    private createLowLine(min: number): void {
        const extremum = this.extremumGetter.getMin();

        if (!extremum) {
            return;
        }

        const k = (min - extremum.value) / (this.i - extremum.idx);
        const b = min - k * this.i;

        // Нормальные условия линии
        if (k > LowLine.minK) {
            const line = new LowLine(k, b, extremum.idx);
            this.lLine = line;
            this.lines.push(line);
            // TODO Deprecated. Use line.startPoint, line.startIdx
            this.lowExtremum = extremum;
            this.waitNext = null;
            // Начинаем искать максиманое значение за период текущего тренда
            this.extremumGetter.resetMax();
        }
    }
}

export class Point {
    y: number
    x: number
}
export interface LineDirective {
    condition: 'lt' | 'gt' | 'lgt'
    value: number
    action: string
}
export class LineModel {
    private type = 'h' || 'l'
    private startPoint: Point
    private prevPoint: Point
    private nextPoint: Point
    private curPoint: Point
    private k: number
    private b: number
    private step: number //Шаг времени в минутах
    private error: number
    constructor(h, l, i, step) {
        this.step = step
        this.init(h, l, i)
        this.startPoint = this.curPoint
    }
    init(h, l, i) {
        this.type = h ? 'h' : 'l'
        this.curPoint = {
            y: h || l,
            x: i
        }
        this.prevPoint = this.curPoint
    }

    /**
     * Пусть минимальный временной шаг в минутах. Но данные могу поступать с разнуми интервалами. Поэтому t имеет значение.
     * На второй точке получаем К
     * Если точка близка к линии - выделяем точку ка индикатор
     * Если текущая точка пробивает линию перестраиваемся
     * Если перестройка ведкт к К меньше К предыдущей линии - сигнал
     * Если перестройка ведет к смене знака К - сигнал (перелом тренда). Может возникнуть только на fork
     * @param h
     * @param l
     * @param i
     */
    update(h, l, i): LineDirective {
        this.init(h, l, i)
        // инициализация К b
        this.k ??= (this.curPoint.y - this.startPoint.y) / (this.curPoint.x - this.startPoint.x)
        this.b ??= this.curPoint.y - this.k * this.curPoint.x
        //Update incline
        if ((this.type == 'h' && this.nextPoint.y > this.curPoint.y) || (this.type == 'l' && this.nextPoint.y < this.curPoint.y)) {
            this.k ??= (this.curPoint.y - this.startPoint.y) / (this.curPoint.x - this.startPoint.x)
            this.b ??= this.curPoint.y - this.k * this.curPoint.x
        }
        //Update next point
        this.nextPoint = {
            y: this.k * (this.curPoint.x + this.step) + this.b,
            x: i + this.step
        }
        return {
            condition: this.type == 'h' ? 'lt' : 'gt',
            value: this.nextPoint.y,
            action: 'fork'
        }
    }

    updateStep(step) {
        this.step = step
    }

}
