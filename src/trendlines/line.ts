import { LineEvent, ExtremumsItem } from './types';
import { Extremums } from './extremum';

export type LineType = 'hLine' | 'lLine';
export class HighLine {
    public startPoint: number;
    public static minK = -0.01;
    public lineType: LineType = 'hLine';
    public archived = false;
    public bounced = 0;

    // Max bounce paramenets
    public maxDelta = 0;
    public maxDeltaIdx = 0;
    public maxDeltaPrice = 0;
    //How close the extremum could come to the TL to estimate it as bounce
    public bounceProximity = 0.5;

    public breakdowned = false;
    public extremumGetter: Extremums;
    private smoothK = 0;
    private smoothB = 0;
    private smoothPrice = 0;
    private minDeltaDepth = 0.2;
    private subtrendMultiplier = 2;
    private subtrends: Array<LowLine | HighLine> = [];
    private prevValue: number;
    private waitSubtrend: LineType = 'hLine';
    private localExtremum: ExtremumsItem;

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
     * Draw the poor resistence line throug first point
     * @param i - time
     * @returns - y
     */
    valueAtPoorLine(i: number) {
        return HighLine.minK * i + this.startPoint - HighLine.minK * this.startIdx;
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
        const delta = pointValue - max;
        let event: LineEvent;

        if (!this.localExtremum || this.localExtremum.value < min) {
            this.localExtremum = { value: min, idx: i };
        }
        // Store max delta during the line period to mesure the bounce
        if (this.maxDelta < delta) {
            this.maxDeltaIdx = i;
            this.maxDelta = delta;
            this.maxDeltaPrice = max;
        }
        //New model
        if (delta < 0) {
            //Line crossing
            if (this.maxDelta > this.minDeltaDepth && this.bounced >= 0) {
                event = LineEvent.BREAKDOWN;
                this.archived = true;
            } else if (max > this.valueAtPoorLine(i)) {
                //Break of the Poor line going through the first tranding line point
                console.log('Breked on poor cond', i, max, this.valueAtPoorLine(i));
                event = LineEvent.BREAKDOWN;
                this.archived = true;
            } else if (this.smoothK !== 0 && this.smoothPrice > max) {
                //Seaching for local maximum to change the tranding line
                // TODO smoothK Deprecated. Calculate on the base of i-1
                this.k = this.smoothK;
                this.b = this.smoothB;
                //Correct the maxDelta value for the new Tline.. TODO Correct the methode
                this.maxDeltaPrice ? this.maxDeltaPrice - this.valueAtPoint(this.maxDeltaIdx) : 0;
                this.smoothB = 0;
                this.smoothK = 0;
                this.smoothPrice = 0;
                event = LineEvent.SMOOTH;
            } else {
                event = this.trySmooth(max, i);
            }
        } else {
            if (this.valueAtPoorLine(i) - max > this.bounceProximity) {
                //TODO. Looking for bounce. Extremum should be close to the TLine
            }
            if (delta > 0 && this.prevValue > max && this.allowSub) {
                // Acceleration hypotise found
                this.trySubtrend(max, i);
            }
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
        this.prevValue = max;

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
    public static minK = 0.01;
    public lineType: LineType = 'lLine';
    public archived = false;
    public bounced = 0;

    public maxDelta = 0;
    public maxDeltaIdx = 0;
    public maxDeltaPrice = 0;
    //How close the extremum could come to the TL to estimate it as bounce
    public bounceProximity = 0.5;

    public breakdowned = false;
    private smoothK = 0;
    private smoothB = 0;
    private smoothPrice = 0;
    private minDeltaDepth = 0.2;
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
    /**
     * Draw the poor resistence line throug first point
     * @param i - time
     * @returns - y
     */
    valueAtPoorLine(i: number) {
        return HighLine.minK * i + this.startPoint - HighLine.minK * this.startIdx;
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
        const delta = min - pointValue;
        let event: LineEvent;

        if (!this.localExtremum || this.localExtremum.value < max) {
            this.localExtremum = { value: max, idx: i };
        }

        // Store max delta during the line period to mesure the bounce
        if (this.maxDelta < delta) {
            this.maxDeltaIdx = i;
            this.maxDelta = delta;
            this.maxDeltaPrice = min;
        }
        //New model
        if (delta < 0) {
            //Line crossing
            if (this.maxDelta > this.minDeltaDepth && this.bounced >= 0) {
                event = LineEvent.BREAKDOWN;
                this.archived = true;
            } else if (min > this.valueAtPoorLine(i)) {
                //Break of the Poor line going through the first tranding line point
                console.log('Breked on poor cond', i, min, this.valueAtPoorLine(i));
                event = LineEvent.BREAKDOWN;
                this.archived = true;
            } else if (this.smoothK !== 0 && this.smoothPrice > min) {
                //Seaching for local maximum to change the tranding line
                this.k = this.smoothK;
                this.b = this.smoothB;
                //Correct the maxDelta value for the new Tline.. TODO Correct the methode
                this.maxDelta = this.maxDeltaPrice ? this.maxDeltaPrice - this.valueAtPoint(this.maxDeltaIdx) : 0;
                this.smoothB = 0;
                this.smoothK = 0;
                this.smoothPrice = 0;
                event = LineEvent.SMOOTH;
            } else {
                event = this.trySmooth(min, i);
            }
        } else {
            if (min - this.valueAtPoorLine(i) > this.bounceProximity) {
                //TODO. Looking for bounce. Extremum should be close to the TLine
            }
            if (delta > 0 && this.prevValue < min && this.allowSub) {
                // Acceleration hypotise found
                this.trySubtrend(min, max, i);
            }
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
