import { LineEvent, LineDirective, Point } from './types'

/**
 * Line Model class.
 * this.index - index in lineDirectives array
 */
 export class LineModel {
    private type: 'h' | 'l'
    public index: number
    public length: number //Line's living time
    public startPoint: Point
    private prevPoint: Point
    public thisPoint: Point //Current Point on the line
    public nextPoint: Point
    public curPoint: Point
    private k: number
    private b: number
    private step: number //Шаг времени в минутах

    constructor(h, l, i, step, index) {
        this.type = 'h';
        this.step = step;
        this.index = index;
        this.startPoint = {
            y: h || l,
            x: i
        }
        this.init(h, l, i);
    }

    init(h, l, i) {
        this.type = h ? 'h' : 'l';
        this.curPoint = {
            y: h || l,
            x: i
        }
        this.length = this.curPoint.x - this.startPoint.x
        this.prevPoint = this.curPoint
    }

    /**
     * Update line object. Returns LineDirectives - actions list for the next candle based on prediction
     * @param h
     * @param l
     * @param i
     */
    update(h, l, i): LineDirective {
        this.init(h, l, i)
        let result = null
        // Init К b
        if (!this.k || isNaN(this.k)) {
            this.k = (this.curPoint.y - this.startPoint.y) / (this.curPoint.x - this.startPoint.x)
            this.b = this.curPoint.y - this.k * this.curPoint.x
            this.nextPoint = { y: this.curPoint.y, x: 0 }
        }
        // Update incline
        if ((this.type == 'h' && this.nextPoint.y < this.curPoint.y) || (this.type == 'l' && this.nextPoint.y > this.curPoint.y)) {
            this.k = (this.curPoint.y - this.startPoint.y) / (this.curPoint.x - this.startPoint.x)
            this.b = this.curPoint.y - this.k * this.curPoint.x
            result = {
                condition: this.type == 'h' ? 'lt' : 'gt',
                value: this.curPoint.y,
                action: 'fork',
                lineIndex: this.index
            }
        }

        // Update next point
        this.thisPoint = {
            y: this.k * (this.curPoint.x) + this.b,
            x: i
        }
        this.nextPoint = {
            y: this.k * (this.curPoint.x + this.step) + this.b,
            x: i + this.step
        }
        return result
    }

    /**
     * Update timescale
     * TODO operate in different time scale
     * @param step
     */
    updateStep(step) {
        this.step = step
    }

}
