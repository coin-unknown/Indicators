import { LineEvent, LineDirective, Point, Env } from './types'
import { LineModel } from './line.model'
import { LinesModel } from './lines.model'

/**
 * Trend state Model
 * The trendModel object use Lines and lineDirectives to estimate current trend state
 */
export class TrendStateModel {
    env: Env
    in: {                                                                         // longer state
        state: null | 'unknown' | 'flat' | 'rise' | 'fall' | 'squeeze',
        lineIndex: number | null,
        line: LineModel | null
        size?: number
    }
    is: {                                                                         // current state
        state: null | 'flat' | 'rise' | 'fall',
        lineIndex: number | null,
        line: LineModel | null,
        size?: number
    }
    was: {                                                                       // prevues state
        state: null | 'flat' | 'rise' | 'fall',
        lineIndex: number,
        line: LineModel | null,
        size?: number
    }
    width: number                                           // longer state trend width
    speed: number                                           // longer state trend speed
    at: number                                              // time ago of the prevues state
    duration: number                                        // duration of the trend
    kdiff: number[] = []
    projection: number
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
            line: null
        }
        this.was = {
            state: null,
            lineIndex: null,
            line: null
        }
        this.width = 0
        this.speed = 0
        this.at = 0
    }

    hlMaxDuration: LineModel | null // Current longest resistance
    llMaxDuration: LineModel | null // Current longest support

    update(hLinesIDs: number[], lLinesIDs: number[]) {
        //Wait for the first turn
        //Init
        // Search of the longest line begun from this.is
        if (hLinesIDs.length > 1)
            this.hlMaxDuration = hLinesIDs.map(lineID => this.lines.id[lineID]).filter(line => (this.is.line ? (line.forkedAt ? line.forkedAt > this.is.line.startPoint.x : (line.rollback ? line.rollback.lastForkTime > this.is.line.startPoint.x : false)) : true)).reduce((prev, current) => {
                return (prev.length > current.length) ? prev : current
            }, this.lines.id[hLinesIDs[0]])
        else this.hlMaxDuration = this.lines.id[hLinesIDs[0]]
        if (lLinesIDs.length > 1)
            this.llMaxDuration = lLinesIDs.map(lineID => this.lines.id[lineID]).filter(line => (this.is.line ? (line.forkedAt ? line.forkedAt > this.is.line.startPoint.x : (line.rollback ? line.rollback.lastForkTime > this.is.line.startPoint.x : false)) : true)).reduce((prev, current) => {
                return (prev.length > current.length) ? prev : current
            }, this.lines.id[lLinesIDs[0]])
        else this.llMaxDuration = this.lines.id[lLinesIDs[0]]

        if (this.is.state == null && this.was.state == null) {
            // Take the minimum trend duration = 5 candles
            this.is.line = (this.llMaxDuration && this.llMaxDuration.length > this.env.minLength && this.hlMaxDuration.length < this.env.minLength) ? this.llMaxDuration //hLines
                : ((this.hlMaxDuration && this.hlMaxDuration.length > this.env.minLength && this.llMaxDuration.length < this.env.minLength) ? this.hlMaxDuration : null)
            if (this.is.line) {
                this.is.lineIndex = this.is.line.index
                this.is.state = this.is.line.type == 'h' ? 'fall' : 'rise'
            }
        }

        if (this.is.state) {
            // Wait for any line good break
            let selectedLine: LineModel = this.lines.id[this.is.lineIndex] || this.lines.id[this.is.line.type == 'h' ? 0 : 1]
            let foundBreak = null
            let delta = null
            let oppositeLines = this.lines.list[selectedLine.type == 'h' ? 1 : 0].filter(id => this.lines.id[id].forked)
            let oppositeLineID = oppositeLines.length > 1 ? oppositeLines[1] : (oppositeLines.length > 0 ? oppositeLines[0] : null)
            if (selectedLine)
                this.lines.list[selectedLine.type == 'h' ? 0 : 1].forEach((lineID, index) => {
                    let theLine = this.lines.id[lineID]
                    let condFastOpposite = this.lines.id[oppositeLineID] ? Math.abs(this.lines.id[oppositeLineID].k) > 0.0003 : true
                    if (lineID >= selectedLine.index) {
                        if (theLine.rollback != null)
                            // Get distance from the last fork on previous or current line
                            if (this.lines.id[lineID > 0 ? lineID - 1 : 0])
                                delta = this.lines.id[lineID > 1 ? this.lines.list[selectedLine.type == 'h' ? 0 : 1][index - 1] : (selectedLine.type == 'h' ? 0 : 1)].lastForkY - theLine.candlePoint.y;
                            else
                                delta = theLine.rollback.lastForkValue - theLine.candlePoint.y;
                        if (theLine.rollback != null          // when break
                            // Allow break less then previous fork value
                            && theLine.rollback.lastForkValue > 0
                            && (
                                (selectedLine.type == 'h' ? delta < 0 : delta > 0)
                                || theLine.rollback.length > this.env.rollbackLength
                            )
                            // and line is forked(bounced). TODO test difference
                            && (
                                ((theLine.candlePoint.x - theLine.rollback.lastForkTime) > this.env.forkDurationMin
                                && (theLine.candlePoint.x - theLine.rollback.lastForkTime) < this.env.forkDurationMax)
                                // Or if intensive change in price
                                || (selectedLine.type == 'h'
                                    ? theLine.candlePoint.y > theLine.startPoint.y
                                    : theLine.candlePoint.y < theLine.startPoint.y
                                )
                            )
                             && theLine.thisPoint.x - theLine.forkedAt > 3
                            // TODO Maybe we should choose shortest and bounced line instead longest
                            && (this.is.state == "fall" ? this.llMaxDuration.length > 1 : this.hlMaxDuration.length > 1)
                        ) foundBreak = lineID + 1
                    }
                })
            if (foundBreak) {
                // Calculate and compare was and is
                // TODO Fix get point from line not the candle
                this.is.size = this.is.line.startPoint.y - this.is.line.thisPoint.y
                this.in.size = (this.was.size || 0) + this.is.size
                // Copy is to was
                this.was = { ...this.is }
                // Update is
                // if exists opposite line with length > ?5 && length < thisLine.length then createOrder
                this.is.line = this.is.state == "fall" ? this.llMaxDuration : this.hlMaxDuration
                this.is.state = this.is.line.type == 'h' ? 'fall' : 'rise'
                this.is.lineIndex = this.is.line.index
            }
        }

        return
    }
}
