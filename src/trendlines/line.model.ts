import { LineEvent, LineDirective, Point } from './types'

/**
 * Line Model class.
 * this.index - index in lineDirectives array
 */
export class LineModel {
    public type: 'h' | 'l'
    public index: number
    public length: number       //Line's living time
    //TODO Make points window in FIFO stack
    public startPoint: Point
    private prevPoint: Point
    public thisPoint: Point     // Current Point on the line
    public nextPoint: Point
    public candlePoint: Point   // Point on the current candle
    public forked: boolean = false      // Flag of bounced line
    public k: number
    private b: number
    private step: number        // Step of time in minutes
    // rollback of the line: the case when a price change direction is opposite the line direction
    public rollback: {
        k: number
        b: number
        length: number
    } | null

    constructor(h, l, i, step, index) {
        this.step = step;
        this.index = index;
        // TODO On fork startPoint is the fork point not the candle point
        this.startPoint = {
            y: h || l,
            x: i
        }
        this.init(h, l, i);
        this.thisPoint = this.startPoint
    }

    init(h, l, i) {
        if (!this.type)
            this.type = h ? 'h' : 'l';
        this.candlePoint = {
            y: this.type == 'h' ? h : l,
            x: i
        }
        this.length = this.candlePoint.x - this.startPoint.x
        // Shift window if data exists
        if (this.thisPoint) {
            this.prevPoint = this.thisPoint
            if (this.nextPoint)
                this.thisPoint = this.nextPoint
            this.nextPoint = {
                y: this.k * (this.candlePoint.x + this.step) + this.b,
                x: this.candlePoint.x + this.step
            }
        }
    }

    /**
     * Update line object. Returns LineDirectives - actions list for the next candle based on prediction
     * @param h
     * @param l
     * @param i
     */
    update(h, l, i): LineDirective {
        let result = null
        this.init(h, l, i)
        // Init К b
        if (!this.k || isNaN(this.k)) {
            this.k = (this.candlePoint.y - this.startPoint.y) / (this.candlePoint.x - this.startPoint.x)
            this.b = this.candlePoint.y - this.k * this.candlePoint.x
            this.prevPoint = this.startPoint
            this.thisPoint = this.candlePoint
            this.nextPoint = {
                y: this.k * (this.candlePoint.x + this.step) + this.b,
                x: this.candlePoint.x + this.step
            }
            result = {
                condition: this.type == 'h' ? 'lt' : 'gt',
                value: this.nextPoint.y,
                action: 'fork',
                lineIndex: this.index
            }

        }
        // Update incline
        if ((this.type == 'h' && this.thisPoint.y < this.candlePoint.y) || (this.type == 'l' && this.thisPoint.y > this.candlePoint.y)) {
            this.k = (this.candlePoint.y - this.startPoint.y) / (this.candlePoint.x - this.startPoint.x)
            this.b = this.candlePoint.y - this.k * this.candlePoint.x
            this.thisPoint = this.candlePoint
            this.nextPoint = {
                y: this.k * (this.candlePoint.x + this.step) + this.b,
                x: this.candlePoint.x + this.step
            }
            let rollbackTime = this.rollback ? this.rollback.length : 0
            let rollbackIncline = this.candlePoint.y - this.prevPoint.y // Take only one candle
            if ((this.type == 'h' ? rollbackIncline > 0 : rollbackIncline < 0))
                this.rollback = {
                    k: rollbackIncline,
                    b: this.candlePoint.y - rollbackIncline * this.candlePoint.x,
                    length: rollbackTime + 1
                }
            else this.rollback = null
            // Wait for bounce
            result = {
                condition: this.type == 'h' ? 'lt' : 'gt',
                value: this.nextPoint.y,
                action: 'fork',
                lineIndex: this.index
            }
        } else {
            // TODO keep rollback length over 1-2 steps going by the line
            this.rollback = null
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
