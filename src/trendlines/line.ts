import { ExtremumsItem, LineEvent } from './types';

export class HighLine {
    public static minK = -0.0001;
    public archived = false;
    public bounced = 0;
    public maxDelta = 0;
    public breakdowned = false;
    private smoothK = 0;
    private smoothB = 0;
    private smoothPrice = 0;
    private minDeltaDepth = 0.025;

    constructor(public k: number, public b: number, public i: number) {}

    valueAtPoint(i: number) {
        return this.k * i + this.b;
    }

    update(value: number, i: number, extremum: ExtremumsItem): LineEvent {
        const pointValue = this.valueAtPoint(i);
        const delta = pointValue - value;
        let event: LineEvent;

        this.maxDelta = Math.max(this.maxDelta, delta);

        if (this.smoothK !== 0 && this.smoothPrice > value) {
            this.k = this.smoothK;
            this.b = this.smoothB;
            this.maxDelta = 0;
            this.bounced = 1;
            this.smoothB = 0;
            this.smoothK = 0;
            this.smoothPrice = 0;

            event = LineEvent.SMOOTH;
        } else if (value > pointValue && this.maxDelta > this.minDeltaDepth && this.bounced > 0) {
            event = LineEvent.BREAKDOWN;
        }

        if (delta < 0) {
            this.trySmooth(value, i, extremum);
        }

        return event;
    }

    private trySmooth(value: number, i: number, extremum: ExtremumsItem) {
        const newK = (value - extremum.value) / (i - extremum.idx - 1);

        if (newK > HighLine.minK) {
            // console.log('poore buy condition');
            // return pointMax;
        } else {
            this.smoothK = newK;
            this.smoothB = value - this.smoothK * i;
            this.smoothPrice = value;
        }
    }
}

export class LowLine {
    public static minK = 0.0001;
    public archived = false;
    public bounced = 0;
    public maxDelta = 0;
    public breakdowned = false;
    private smoothK = 0;
    private smoothB = 0;
    private smoothPrice = 0;
    private minDeltaDepth = 0.025;

    constructor(public k: number, public b: number, public i: number) {}

    valueAtPoint(i: number) {
        return this.k * i + this.b;
    }

    update(value: number, i: number, extremum: ExtremumsItem): LineEvent {
        const pointValue = this.valueAtPoint(i);
        const delta = value - pointValue;
        let event: LineEvent;

        this.maxDelta = Math.max(this.maxDelta, delta);

        if (this.smoothK !== 0 && this.smoothPrice < value) {
            this.k = this.smoothK;
            this.b = this.smoothB;
            this.maxDelta = 0;
            this.bounced = 1;
            this.smoothB = 0;
            this.smoothK = 0;
            this.smoothPrice = 0;

            event = LineEvent.SMOOTH;
        } else if (value < pointValue && this.maxDelta > this.minDeltaDepth && this.bounced > 0) {
            event = LineEvent.BREAKDOWN;
        }

        if (delta < 0) {
            this.trySmooth(value, i, extremum);
        }

        return event;
    }

    private trySmooth(value: number, i: number, extremum: ExtremumsItem) {
        const newK = (value - extremum.value) / (i - extremum.idx - 1);

        if (newK < LowLine.minK) {
            // console.log('poore buy condition');
            // return pointMax;
        } else {
            this.smoothK = newK;
            this.smoothB = value - this.smoothK * i;
            this.smoothPrice = value;
        }
    }
}
