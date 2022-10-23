import { LineEvent, LineDirective, Point, Env } from './types'
import { LineModel } from './line.model'
import { LinesModel } from './lines.model'
import { ZigZagI } from './zigzag'

/**
 * Trend state Model
 * The trendModel object use Lines and lineDirectives to estimate current trend state
 * @property hlMaxDuration - Current longest resistance
 */

export class TrendStateModel {
    public zigZag: ZigZagI
    env: Env
    /** Trend longer state (was+is) */
    in: {
        state: null | 'unknown' | 'flat' | 'rise' | 'fall' | 'squeeze',
        lineIndex: number | null,
        line: LineModel | null
        size?: number
    }
    /** Trend current state */
    is: {
        state: null | 'flat' | 'rise' | 'fall',
        lineIndex: number | null,
        line: LineModel | null,
        size?: number,
        start: {
            x: number,
            y: number
        }
    }
    /** Trend  previous state*/
    was: {
        state: null | 'flat' | 'rise' | 'fall',
        lineIndex: number,
        line: LineModel | null,
        size?: number
        success?: boolean
    }
    /**  Current longest resistance */
    hlMaxDuration: LineModel | null
    /** Current longest support */
    llMaxDuration: LineModel | null
    /** link to all lines */
    lines: LinesModel
    constructor(lines: LinesModel, env: Env) {
        this.env = env
        this.lines = lines
        this.in = {
            state: null,
            lineIndex: null,
            line: null
        }
        this.is = {
            state: null,
            lineIndex: null,
            line: null,
            start: null,
            size: 0
        }
        this.was = {
            state: null,
            lineIndex: null,
            line: null,
            size: null
        }
        this.hlMaxDuration = null
        this.llMaxDuration = null
    }

    update(hLinesIDs: number[], lLinesIDs: number[]) {
        // Zigzag
        if (! this.zigZag){
            this.zigZag = new ZigZagI(this.lines.id[0].candlePoint.x, this.lines.id[0].candlePoint.y)
        } else{
            this.zigZag.update(this.lines.id[0].candlePoint.x, this.lines.id[0].candlePoint.y)
        }
        // Get lines hlMaxDuration and llMaxDuration with longest length
        if (hLinesIDs.length > 1)
            this.hlMaxDuration = hLinesIDs.map(lineID => this.lines.id[lineID]).filter(line => (this.is.line ? (line.forks.last().t ? line.forks.last().t > this.is.line.startPoint.x : false) : true)).reduce((prev, current) => {
                return (prev.length > current.length) ? prev : current
            }, this.lines.id[hLinesIDs[0]])
        else this.hlMaxDuration = this.lines.id[hLinesIDs[0]]
        if (lLinesIDs.length > 1)
            this.llMaxDuration = lLinesIDs.map(lineID => this.lines.id[lineID]).filter(line => (this.is.line ? (line.forks.last().t ? line.forks.last().t > this.is.line.startPoint.x : false) : true)).reduce((prev, current) => {
                return (prev.length > current.length) ? prev : current
            }, this.lines.id[lLinesIDs[0]])
        else this.llMaxDuration = this.lines.id[lLinesIDs[0]]

        // Init first state after reaching the minimum initial line length this.env.minLength
        if (this.is.state == null && this.was.state == null) {
            this.is.line = (this.llMaxDuration && this.llMaxDuration.length > this.env.minLength && this.hlMaxDuration.length < this.env.minLength) ? this.llMaxDuration //hLines
                : ((this.hlMaxDuration && this.hlMaxDuration.length > this.env.minLength && this.llMaxDuration.length < this.env.minLength) ? this.hlMaxDuration : null)
            if (this.is.line) {
                this.is.lineIndex = this.is.line.index
                this.is.state = this.is.line.type == 'h' ? 'fall' : 'rise'
                this.is.start = {
                    x: this.is.line.startPoint.x,
                    y: this.is.line.startPoint.y
                }
            }
        }

        if (this.is.state) {
            // Wait for any line good break
            this.is.size = Math.max(this.is.size, Math.abs(this.is.start.y - this.is.line.candlePoint.y))
            let selectedLine: LineModel = this.lines.id[this.is.lineIndex] || this.lines.id[this.is.line.type == 'h' ? 0 : 1]
            let foundBreak = null
            let delta = null
            let prevLineID: number
            let oppositeLines = this.lines.list[selectedLine.type == 'h' ? 1 : 0].filter(id => this.lines.id[id].forks.isForked && (this.lines.id[id].thisPoint.x - this.lines.id[id].forks.last().t) > 1)
            let oppositeLineID = oppositeLines.length > 1 ? oppositeLines[1] : (oppositeLines.length > 0 ? oppositeLines[0] : null)
            let oppositeLinesInsideTrend = oppositeLines.filter(id => this.lines.id[id].forks.last().t > this.is.start.x)
            let onBreak: {
                [id: string]: {
                    cond: boolean,
                    desc: string
                }[]
            }
            if (selectedLine)
                this.lines.list[selectedLine.type == 'h' ? 0 : 1].forEach((lineID, index) => {
                    let theLine = this.lines.id[lineID]
                    // Trend change conditions
                    if (lineID >= selectedLine.index && theLine.rollback != null) { // when break on inner lines
                        // Get distance from the last fork on previous or current line
                        prevLineID = this.lines.list[selectedLine.type == 'h' ? 0 : 1][index - 1]
                        const cond = (this.env.deltaModel == 1 && index > 1 && prevLineID && this.lines.id[prevLineID]) ? (index > 1 && prevLineID && this.lines.id[prevLineID].lastForkY) : (this.lines.id[lineID > 0 ? lineID - 1 : 0])
                        if (cond)
                            delta = this.lines.id[lineID > 1 ? prevLineID : (selectedLine.type == 'h' ? 0 : 1)].lastForkY - theLine.candlePoint.y;
                        else if (theLine.rollback)
                            delta = theLine.forks.last().t - theLine.candlePoint.y;
                        else
                            delta = 0
                        onBreak = {
                            '1': [{
                                cond: theLine.thisPoint.x - theLine.forks.last().t > this.env.minRightLeg,
                                desc: 'Правое плечо больше заданного'
                            }],
                            '2': [{
                                cond: (this.is.state == "fall" ? this.llMaxDuration.length > 1 : this.hlMaxDuration.length > 1),
                                desc: 'Есть противоположная линия тренда'
                            }],
                            '3': [{
                                cond: (selectedLine.type == 'h' ? delta < 0 : delta > 0),
                                desc: 'Пробит предыдущий экстремум'
                            },
                            {
                                cond: theLine.rollback.length > this.env.rollbackLength,
                                desc: 'Пробой длится дольше ' + this.env.rollbackLength
                            },
                            {
                                cond: (selectedLine.type == 'h'
                                    ? theLine.candlePoint.y > this.is.start.y && this.lines.list[0].length == 1 && theLine.rollback.length > 1
                                    : theLine.candlePoint.y < this.is.start.y && this.lines.list[1].length == 1) && theLine.rollback.length > 1,
                                desc: 'Пробита стартовая позиция крайней линии'
                            }
                                /*,
                                {
                                    cond: Math.abs(theLine.k) > 0.005
                                    && theLine.thisPoint.x - theLine.forks.last().t > 30
                                    && theLine.thisPoint.x - theLine.forks.last().t < 50,
                                    desc: 'Super fast'
                                },
                                {
                                    cond: oppositeLinesInsideTrend.length > 1,
                                    desc: 'Активное ветвление с противоположной стороны'
                                },
                                {
                                    cond: (this.is.size * 1 / 3 > Math.abs(this.is.start.y - this.is.line.candlePoint.y) && this.is.size > this.is.line.candlePoint.y * this.env.minIsSizeOnRollback)
                                        && oppositeLinesInsideTrend.length > 1,
                                    desc: 'Цена откатилась больше заданной внутри тренда, превысившего заданный размер'
                                } */
                            ],
                            '4': [{
                                cond: (
                                    (theLine.candlePoint.x - theLine.forks.last().t) > this.env.forkDurationMin
                                    && (theLine.candlePoint.x - theLine.forks.last().t) < this.env.forkDurationMax
                                ),
                                desc: 'Предыдущее ветвление произошло в заданный период'
                            },
                            {
                                cond: selectedLine.type == 'h'
                                    ? theLine.candlePoint.y > theLine.startPoint.y
                                    : theLine.candlePoint.y < theLine.startPoint.y,
                                desc: 'Пробита стартовая позиция этой линии'
                            },
                            {
                                cond: (selectedLine.type == 'h'
                                    ? theLine.candlePoint.y > this.is.start.y && this.lines.list[0].length == 1
                                    : theLine.candlePoint.y < this.is.start.y && this.lines.list[1].length == 1),
                                desc: 'Пробита стартовая позиция крайней линии'
                            }]
                        }
                        let breakCondition = Object.keys(onBreak).map(key => onBreak[key]).every(onB => onB.some(el => el.cond))
                        // log
                        /*                           if (theLine.rollback.length == 1
                                                    && this.env.minLog > 0
                                                    && this.lines.id[0].candlePoint.x > this.env.minLog
                                                    && this.lines.id[0].candlePoint.x < this.env.maxLog) {
                                                    console.log(lineID, this.lines.id[0].candlePoint.x, this.is.size * 1 / 3, Math.abs(this.is.start.y - this.is.line.candlePoint.y), oppositeLines, onBreak)
                                                } */
                        if (this.env.minLog > 0
                            && breakCondition
                            && this.lines.id[0].candlePoint.x > this.env.minLog
                            && this.lines.id[0].candlePoint.x < this.env.maxLog
                        )
                            console.log(lineID, this.lines.id[0].candlePoint.x, oppositeLinesInsideTrend, onBreak)
                        if (theLine.forks.last().t > 0 && breakCondition)
                            foundBreak = lineID + 1
                    }
                })
            // Через время после установки новой позиции следим за тем, чтобы тренд вышел в плюс, иначе разворачиваемся.
            if (this.env.checkBefore) {
                const minusDelta = selectedLine.type == 'h' ? this.lines.id[0].candlePoint.y - this.is.start.y : this.is.start.y - this.lines.id[0].candlePoint.y
                if ((this.lines.id[0].candlePoint.x - this.is.start.x < this.env.checkBefore) && (this.lines.id[0].candlePoint.x - this.is.start.x > this.env.checkAfter) && minusDelta > this.lines.id[0].candlePoint.y / this.env.checkDelta && oppositeLines.length > 0)
                    foundBreak = oppositeLines[0];
            }
            if (foundBreak) {
                // Calculate and compare was and is
                this.in.size = (this.was.size || 0) + this.is.size;
                // Estimate in state
                const dif = this.lines.id[0].candlePoint.y - this.is.start.y;
                const isSuccess = this.is.state == "rise" ? dif >= 0 : dif < 0;
                if (this.was.size)
                    this.in.state = this.was.size > this.is.size ? this.was.state : this.is.state;
                // Copy is to was
                this.was = { ...this.is }
                this.was.success = isSuccess
                // Update is
                // if exists opposite line with length > ?5 && length < thisLine.length then createOrder
                this.is.line = this.is.state == "fall" ? this.llMaxDuration : this.hlMaxDuration
                this.is.state = this.is.line.type == 'h' ? 'fall' : 'rise'
                this.is.lineIndex = this.is.line.index
                this.is.start = this.lines.id[0].candlePoint
                this.is.size = 0
            }
        }
        return
    }
}
