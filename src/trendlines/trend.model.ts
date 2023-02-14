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
    public env: Env
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
            this.zigZag = new ZigZagI(this.lines.id[0].candlePoint.x, this.lines.id[0].candlePoint.y, this.env)
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
    }
}
