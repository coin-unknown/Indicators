import { LineEvent, LineDirective, Point, Env } from './types'

/**
 * Line Model class.
 * this.index - index in lineDirectives array
 */
export class LineModel {
    private env: Env
    public type: 'h' | 'l'
    public index: number
    public length: number               //Line's living time
    public startPoint: Point
    public prevPoint: Point
    public thisPoint: Point             // Current Point on the line
    public nextPoint: Point
    public candlePoint: Point           // Point on the current candle
    public forked: boolean = false      // Flag of bounced line. At least 3-rd point
    public forkedAt: number = 0         // Time of the last fork
    public forkedValue: number          // Price of the last fork
    // TODO Deprecated
    public lastForkY: number = null     // Last fork or extremum point
    public k: number
    private b: number
    private step: number                // Step of time in minutes
    // rollback of the line: the case when a price change direction to opposite direction
    public rollback: {
        k: number
        b: number
        length: number
        lastForkTime: number
        lastForkValue: number
    } | null

    constructor(h, l, i, step, index, prevPoint = null, env) {
        this.env = env
        this.step = step
        this.index = index
        this.length = 0
        // TODO On fork startPoint is the fork point but the candle point
        // TODO Test
        this.startPoint = prevPoint ?
            {
                y: h ? prevPoint.h : prevPoint.l,
                x: prevPoint.x
            }
            : {
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
     * @return параметры для ветвления линии
     */
    update(h, l, i): LineDirective {
        let result = null
        this.length++
        this.init(h, l, i)
        // Init К b
        if (!this.k || isNaN(this.k)) {
            // TODO проверить, есть ли ситуация, при которой this.candlePoint.y = this.startPoint.y кроме первой точки?
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
        if ((this.type == 'h' && this.thisPoint.y <= this.candlePoint.y) || (this.type == 'l' && this.thisPoint.y >= this.candlePoint.y)) {
            this.k = (this.candlePoint.y - this.startPoint.y) / (this.candlePoint.x - this.startPoint.x)
            this.b = this.candlePoint.y - this.k * this.candlePoint.x
            this.thisPoint = this.candlePoint
            // TODO Получается, что если линия корректируется, то она начинается с начала. Это по идее не верно. Может не стоит сбрасывать длину линии. Проверить.
            // Иначе это получается длина с последнего fork. По идее длина линия не должна обнуляться
            this.length = 0
            this.nextPoint = {
                y: this.k * (this.candlePoint.x + this.step) + this.b,
                x: this.candlePoint.x + this.step
            }
            let rollbackTime = this.rollback ? this.rollback.length : 0
            let rollbackIncline = this.candlePoint.y - this.prevPoint.y // Take only one candle
            // Set rollback flag if moving away from the prevPoint (not the nextPoint!)
            if ((this.type == 'h' ? rollbackIncline > 0 : rollbackIncline < 0)) {
                this.rollback = {
                    k: rollbackIncline,
                    b: this.candlePoint.y - rollbackIncline * this.candlePoint.x,
                    length: rollbackTime + 1,
            // TODO Нужно улучшить хранение информации об истории ветвления. Вопрос в том, что может потребоваться в дальнейшем.
            /**
             * Если линия корректируется, то она приближается к родительской линии до уничтожения. Тут стоит улучшить.
             * Если линия не ветвилась, значит - конечная линия. Но Это можно и по размеру массива выяснить.
             */
                    lastForkTime: this.forkedAt || (this.rollback ? this.rollback.lastForkTime : 0),
                    lastForkValue: this.forkedValue || (this.rollback ? this.rollback.lastForkValue : 0),
                }
                // If rollback then the line lost the fork point
                // TODO Use accuracy to reset the forked value
                this.forked = false
                this.forkedAt = null
                this.forkedValue = null
            }
            else {
/*                 this.forkedAt = this.candlePoint.x
                this.forkedValue = this.candlePoint.y
                this.forked = true */
                this.rollback = null
            }
            // Add bounce accuracy
            /**
             * TODO. Тут тоже слишком буквальная интерпретация отскока. Он все-таки должен возникать в результате форка. Думаю, этот фрагмент удалить.
             */
              if (this.env.bounceAccuracy != null && Math.abs(this.candlePoint.y - this.prevPoint.y) < this.env.bounceAccuracy //0.004
                && this.candlePoint.x - this.forkedAt > 4) {
                this.forkedAt = this.candlePoint.x;
                this.forkedValue = this.candlePoint.y;
                this.forked = true;
            }
            // Wait for bounce
            result = {
                condition: this.type == 'h' ? 'lt' : 'gt',
                value: this.nextPoint.y,
                action: 'fork',
                lineIndex: this.index
            }
        } else {
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
