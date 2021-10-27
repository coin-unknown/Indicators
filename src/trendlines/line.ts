import { LineEvent, ExtremumsItem } from './types';
import { Extremums } from './extremum';

export type LineType = 'hLine' | 'lLine';
export class HighLine {
    public startPoint: number;
    public static minK = -0.0001;
    public lineType: LineType = 'hLine';
    public archived = false;
    public bounced = 0;
    // Max bounce paramenets
    public maxDelta = 0;
    public maxDeltaIdx = 0;
    public maxDeltaPrice = 0;

    public breakdowned = false;
    public extremumGetter: Extremums;
    private smoothK = 0;
    private smoothB = 0;
    private smoothPrice = 0;
    private minDeltaDepth = 0.02;
    private subtrendMultiplier = 2;
    private subtrends: Array<LowLine | HighLine> = [];
    private prevValue: number;
    private waitSubtrend: LineType = 'hLine';

    constructor(public k: number, public b: number, public startIdx: number, private allowSub: boolean = true) {
        this.startPoint = this.valueAtPoint(this.startIdx);
        this.extremumGetter = new Extremums();
    }

    getSubtrendValue(i: number) {
        const subtrendsLength = this.subtrends.length;

        if (subtrendsLength) {
            const subtrend = this.subtrends[subtrendsLength - 1];

            return subtrend.valueAtPoint(i);
        }

        return null;
    }
    /**
     * Значение в координате i
     * @param i candle number
     * @returns Значение во время i
     */
    valueAtPoint(i: number) {
        return this.k * i + this.b;
    }
    /**
     * Resistance trend update
     * @param min - min of open, close
     * @param max
     * @param i
     * @returns
     */
    update(min: number, max: number, i: number): LineEvent {
        const pointValue = this.valueAtPoint(i);
        //difference of line and candle value
        const delta = pointValue - min;
        let event: LineEvent;
        // Store max delta during the line period to mesure the bounce
        if (this.maxDelta < delta) {
            this.maxDeltaIdx = i;
            this.maxDelta = delta;
            this.maxDeltaPrice = min;
        }
        // prepare data in case of bounce
        // TODO smoothK Deprecated. Calculate on the base of i-1
        if (this.smoothK !== 0 && this.smoothPrice > min) {
            this.k = this.smoothK;
            this.b = this.smoothB;
            this.maxDelta = this.valueAtPoint(this.maxDeltaIdx) - this.maxDeltaPrice;
            this.bounced++;
            this.smoothB = 0;
            this.smoothK = 0;
            this.smoothPrice = 0;

            event = LineEvent.SMOOTH;
            // TODO this.bounced > 1 || this.bounced > 0
        } else if (min > pointValue && this.maxDelta > this.minDeltaDepth && this.bounced > 1) {
            event = LineEvent.BREAKDOWN;
            this.archived = true;
            // строим новую линию
            // строим новую лонг линию (по минимумам)
            // нужно считать производную дельты
            // ускорение производное скорости, как текущая дельта - предыдущую
            // если разница > CONSTANT P , то мы начинаем строить новую трендовую линию через текущую точку и предыдущую
        } else if (delta < 0) {
            event = this.trySmooth(min, i);
        } else if (delta > 0 && this.prevValue > min && this.allowSub) {
            // Acceleration hypotise found
            this.trySubtrend(min, i);
        }

        // If subtrend exists then calculate last one
        if (this.subtrends.length) {
            const subtrendEvent = this.subtrends[this.subtrends.length - 1].update(min, max, i);
            // Wait for brakedown of the subtrend
            if (subtrendEvent === LineEvent.BREAKDOWN) {
                this.subtrends.length = 0;
            }
        }

        // Store last value to use on the next step
        this.prevValue = min;

        return event;
    }

    private trySmooth(value: number, i: number) {
        const newK = (value - this.startPoint) / (i - this.startIdx);

        if (newK > HighLine.minK) {
            return LineEvent.BREAKDOWN;
        } else {
            this.smoothK = newK;
            this.smoothB = value - this.smoothK * i;
            this.smoothPrice = value;
        }
    }

    private trySubtrend(value: number, i: number) {
        const k = value - this.prevValue;
        const b = value - k * i;
        const subtrend = this.subtrends[this.subtrends.length - 1];

        // Нормальные условия линии
        if (k < this.k * this.subtrendMultiplier && (!subtrend || k < subtrend.k * this.subtrendMultiplier)) {
            this.subtrends.push(new HighLine(k, b, i - 1, false));
        }
    }
}

export class LowLine {
    public startPoint: number;
    public static minK = 0.0001;
    public lineType: LineType = 'lLine';
    public archived = false;
    public bounced = 0;
    public maxDelta = 0;
    public maxDeltaIdx = 0;
    public maxDeltaPrice = 0;
    public breakdowned = false;
    private smoothK = 0;
    private smoothB = 0;
    private smoothPrice = 0;
    private minDeltaDepth = 0.02;
    private subtrendMultiplier = 2;
    private subtrends: Array<LowLine | HighLine> = [];
    private prevValue: number;
    private waitSubtrend: LineType = 'lLine';
    private localExtremum: ExtremumsItem;

    constructor(public k: number, public b: number, public startIdx: number, private allowSub: boolean = true) {
        this.startPoint = this.valueAtPoint(this.startIdx);
    }

    getSubtrendValue(i: number) {
        const subtrendsLength = this.subtrends.length;

        if (subtrendsLength) {
            const subtrend = this.subtrends[subtrendsLength - 1];

            return subtrend.valueAtPoint(i);
        }

        return null;
    }

    valueAtPoint(i: number) {
        return this.k * i + this.b;
    }

    update(min: number, max: number, i: number): LineEvent {
        const pointValue = this.valueAtPoint(i);
        const delta = min - pointValue;
        let event: LineEvent;

        if (!this.localExtremum || this.localExtremum.value < max) {
            this.localExtremum = { value: max, idx: i };
        }

        if (this.maxDelta < delta) {
            this.maxDeltaIdx = i;
            this.maxDelta = delta;
            this.maxDeltaPrice = min;
        }

        if (this.smoothK !== 0 && this.smoothPrice < min) {
            this.k = this.smoothK;
            this.b = this.smoothB;
            this.maxDelta = this.maxDeltaPrice ? this.maxDeltaPrice - this.valueAtPoint(this.maxDeltaIdx) : 0;
            this.bounced = 1;
            this.smoothB = 0;
            this.smoothK = 0;
            this.smoothPrice = 0;

            event = LineEvent.SMOOTH;
        } else if (min < pointValue && this.maxDelta > this.minDeltaDepth && this.bounced > 0) {
            event = LineEvent.BREAKDOWN;
        } else if (delta < 0) {
            event = this.trySmooth(min, i);
        } else if (delta > 0 && this.prevValue < min && this.allowSub) {
            this.trySubtrend(min, max, i);
        }

        if (this.subtrends.length) {
            const subtrend = this.subtrends[this.subtrends.length - 1];
            const subEvent = subtrend.update(min, max, i);

            if (subEvent === LineEvent.BREAKDOWN) {
                // this.subtrends.pop();
                this.subtrends.length = 0;
                // if (this.subtrends.length == 0) {
                this.waitSubtrend = subtrend.lineType === 'lLine' ? 'hLine' : 'lLine';
                // }
            }
        }

        this.prevValue = min;

        return event;
    }

    private trySmooth(value: number, i: number) {
        const newK = (value - this.startPoint) / (i - this.startIdx);

        if (newK < LowLine.minK) {
            return LineEvent.BREAKDOWN;
        } else {
            this.smoothK = newK;
            this.smoothB = value - this.smoothK * i;
            this.smoothPrice = value;
            return LineEvent.WAIT_SMOOTH;
        }
    }

    private trySubtrend(min: number, max: number, i: number) {
        if (this.waitSubtrend === 'lLine') {
            const k = min - this.prevValue;
            const b = min - k * i;
            const subtrend = this.subtrends[this.subtrends.length - 1];

            // Нормальные условия нижней линии сабтренда
            if (k > this.k * this.subtrendMultiplier && (!subtrend || k > subtrend.k * this.subtrendMultiplier)) {
                this.subtrends.length = 0;
                this.subtrends.push(new LowLine(k, b, i - 1, false));
            }
        } else if (this.waitSubtrend === 'hLine') {
            const k = (max - this.localExtremum.value) / (i - this.localExtremum.idx);
            const b = max - k * i;

            // Нормальные условия верхней линии сабтренда
            if (k < HighLine.minK) {
                this.subtrends.push(new HighLine(k, b, this.localExtremum.idx, false));
                this.waitSubtrend = null;
            }
        }
    }
}
