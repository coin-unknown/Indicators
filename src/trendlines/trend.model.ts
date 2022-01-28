import { LineEvent, LineDirective, Point } from './types'
import { LineModel } from './line.model'
import { LinesModel } from './lines.model'

/**
 * Trend state Model
 * The trendModel object use Lines and lineDirectives to estimate current trend state
 */
export class TrendStateModel {
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
    constructor(lines: LinesModel) {
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

    /**
        * Trend v 0.2.0
        * when break (and line is forked && length > 5)
        * if exists opposite line with length > ?5 && length < thisLine.length then createOrder
        * Stop loss keep ?5 candles
        * when thisLine breaks or other lines being (forked && length > 5) has broken - closeOrder
      */
    hlMaxDuration: LineModel | null
    llMaxDuration: LineModel | null

    update(hLinesIDs: number[], lLinesIDs: number[]) {
        //Wait for the first tern
        //Init
        if (hLinesIDs.length > 1)
            this.hlMaxDuration = hLinesIDs.map(lineID => this.lines.id[lineID]).reduce((prev, current) => {
                return (prev.length > current.length) ? prev : current
            })
        else this.hlMaxDuration = this.lines.id[hLinesIDs[0]]
        if (lLinesIDs.length > 1)
            this.llMaxDuration = lLinesIDs.map(lineID => this.lines.id[lineID]).reduce((prev, current) => {
                return (prev.length > current.length) ? prev : current
            })
        else this.llMaxDuration = this.lines.id[lLinesIDs[0]]

        if (this.is.state == null && this.was.state == null) {
            // Take the minimum trend duration = 5 candles
            let firstTimeFrame = 5
            this.is.line = (this.llMaxDuration && this.llMaxDuration.length > firstTimeFrame && this.hlMaxDuration.length < firstTimeFrame) ? this.llMaxDuration //hLines
                : ((this.hlMaxDuration && this.hlMaxDuration.length > firstTimeFrame && this.llMaxDuration.length < firstTimeFrame) ? this.hlMaxDuration : null)
            if (this.is.line) {
                this.is.lineIndex = this.is.line.index
                this.is.state = this.is.line.type == 'h' ? 'fall' : 'rise'
            }
        }

        if (this.is.state) {
            // Wait for any line good break
            let selectedLine: LineModel = this.lines.id[this.is.lineIndex]
            let foundBreak = null
            if (selectedLine)
                this.lines.list[selectedLine.type == 'h' ? 0 : 1].forEach(lineID => {
                    if (lineID >= selectedLine.index) {
                        //  when break (and line is forked(bounced) && length > 3
                        if (this.lines.id[lineID].rollback != null         //  when break
                            && this.lines.id[lineID].forked         // and line is forked(bounced)
                            && this.lines.id[lineID].thisPoint.x - this.lines.id[lineID].forkedAt > 3
                            && (this.is.state == "fall" ? this.llMaxDuration.length > 1 : this.hlMaxDuration.length > 1)
                        ) foundBreak = lineID
                    }
                })
            if (foundBreak) {
                // Calculate and compare was and is
                this.is.size = this.is.line.startPoint.y - this.is.line.thisPoint.y
                this.in.size = this.was.size + this.is.size
                // Copy is to was
                this.was = { ...this.is }
                // Update is
                // if exists opposite line with length > ?5 && length < thisLine.length then createOrder
                this.is.line = this.is.state == "fall" ? this.llMaxDuration : this.hlMaxDuration
                this.is.state = this.is.line.type == 'h' ? 'fall' : 'rise'
                this.is.lineIndex = this.is.line.index
            }
        }

        return [(this.is.state && this.is.state == 'fall') ? 2780 : 2800]
    }
}
