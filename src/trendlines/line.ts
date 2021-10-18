import { LineEvent } from './types';

export type LineType = 'hLine' | 'lLine';
export class HighLine {
    public startPoint: number;
    public static minK = -0.0001;
    public lineType: LineType = 'hLine';
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
    private waitSubtrend: LineType = 'hLine';

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

    update(value: number, i: number): LineEvent {
        const pointValue = this.valueAtPoint(i);
        const delta = pointValue - value;
        let event: LineEvent;

        if (this.maxDelta < delta) {
            this.maxDeltaIdx = i;
            this.maxDelta = delta;
            this.maxDeltaPrice = value;
        }

        if (this.smoothK !== 0 && this.smoothPrice > value) {
            this.k = this.smoothK;
            this.b = this.smoothB;
            this.maxDelta = this.valueAtPoint(this.maxDeltaIdx) - this.maxDeltaPrice;
            this.bounced = 1;
            this.smoothB = 0;
            this.smoothK = 0;
            this.smoothPrice = 0;

            event = LineEvent.SMOOTH;
        } else if (value > pointValue && this.maxDelta > this.minDeltaDepth && this.bounced > 0) {
            event = LineEvent.BREAKDOWN;
            this.archived = true;
            // строим новую линию
            // строим новую лонг линию (по минимумам)
            // нужно считать производную дельты
            // ускорение производное скорости, как текущая дельта - предыдущую
            // если разница > CONSTANT P , то мы начинаем строить новую трендовую линию через текущую точку и предыдущую
        } else if (delta < 0) {
            event = this.trySmooth(value, i);
        } else if (delta > 0 && this.prevValue > value && this.allowSub) {
            this.trySubtrend(value, i);
        }

        if (this.subtrends.length) {
            const subtrendEvent = this.subtrends[this.subtrends.length - 1].update(value, i);

            if (subtrendEvent === LineEvent.BREAKDOWN) {
                this.subtrends.length = 0;
            }
        }

        this.prevValue = value;

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

    update(value: number, i: number): LineEvent {
        const pointValue = this.valueAtPoint(i);
        const delta = value - pointValue;
        let event: LineEvent;

        if (this.maxDelta < delta) {
            this.maxDeltaIdx = i;
            this.maxDelta = delta;
            this.maxDeltaPrice = value;
        }

        if (this.smoothK !== 0 && this.smoothPrice < value) {
            this.k = this.smoothK;
            this.b = this.smoothB;
            this.maxDelta = this.maxDeltaPrice ? this.maxDeltaPrice - this.valueAtPoint(this.maxDeltaIdx) : 0;
            this.bounced = 1;
            this.smoothB = 0;
            this.smoothK = 0;
            this.smoothPrice = 0;

            event = LineEvent.SMOOTH;
        } else if (value < pointValue && this.maxDelta > this.minDeltaDepth && this.bounced > 0) {
            event = LineEvent.BREAKDOWN;
        } else if (delta < 0) {
            event = this.trySmooth(value, i);
        } else if (delta > 0 && this.prevValue < value && this.allowSub) {
            this.trySubtrend(value, i);
        }

        if (this.subtrends.length) {
            const subEvent = this.subtrends[this.subtrends.length - 1].update(value, i);

            if (subEvent === LineEvent.BREAKDOWN) {
                this.subtrends.length = 0;
            }
        }

        this.prevValue = value;

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

    private trySubtrend(value: number, i: number) {
        const k = value - this.prevValue;
        const b = value - k * i;

        if (this.waitSubtrend === 'lLine') {
            const subtrend = this.subtrends[this.subtrends.length - 1];

            // Нормальные условия нижней линии сабтренда
            if (k > this.k * this.subtrendMultiplier && (!subtrend || k > subtrend.k * this.subtrendMultiplier)) {
                this.subtrends.push(new LowLine(k, b, i - 1, false));
            }
        } else if (this.waitSubtrend === 'hLine') {
             // Нормальные условия верхней линии сабтренда
             if () {
                this.subtrends.push(new HighLine(k, b, i - 1, false));
            }
        }
    }
}
