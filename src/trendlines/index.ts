import { LineModel } from './line.model'
import { LinesModel } from './lines.model'
import { LineEvent, LineDirective, Point, Env } from './types'
import { TrendStateModel } from './trend.model'

export type { LinesModel, TrendStateModel, Env };
export class Indicator {
    public hLineDirectives: LineDirective[] = []
    public lLineDirectives: LineDirective[] = []
    public trend: TrendStateModel
    private lines: LinesModel
    private step: number = 1        // TODO operate in different time scale
    private i: number = 0
    public env: Env
    // Settings
    // Debug values
    localCounter = 0
    consoleWindow: boolean
    minLog
    maxLog
    prevPoint: {
        x: number,
        l: number,
        h: number
    } = null
    /**
     *
     * @param pars type of Env
     */
    constructor(pars) {
        // Assign defaults
        this.env = Object.assign({
            step: 1,               // time step in minutes
            minLength: 5,
            minLeftLeg: 3,
            maxForks: 10,
            minLog: 0,
            maxLog: 0,
            rollbackLength: 3,  // Устойчивый откат после пробоя линии тренда
            forkDuration: 3,    // Лимитное значение минимальной длительности волны
            deltaModel: 1
        }, pars)
        this.lines = new LinesModel(this.step)
        this.trend = new TrendStateModel(this.lines, this.env)
    }

    log(title, ...data) {
        this.consoleWindow = this.env.minLog < this.localCounter && this.localCounter < this.env.maxLog
        if (this.consoleWindow)
            console.log(title, ...data)
    }

    /**
     * Operate next candle method
     * @param o
     * @param c
     * @param h
     * @param l
     * @returns - arrow of 6 lines points
     */
    nextValue(o: number, c: number, h: number, l: number) {
        this.localCounter++

        // Apply line directives got on prevues step
        if (this.lLineDirectives.length > 0) {
            // TODO Fork only last line in Array
            this.lLineDirectives.forEach((d, i) => {
                if (d.condition == 'gt' && l > d.value && d.action == 'fork') {
                    if (this.lines.id[d.lineIndex]) {
                        if (d.lineIndex != undefined && this.lines.id[d.lineIndex] != undefined && this.lines.id[d.lineIndex].k < 0)
                            this.lines.add(null, l, this.i - 1, this.prevPoint, d.lineIndex) // New extremum found
                        else {
                            this.lines.id[d.lineIndex].forked = true
                            this.lines.id[d.lineIndex].forkedAt = this.lines.id[d.lineIndex].thisPoint.x
                            this.lines.id[d.lineIndex].forkedValue = this.lines.id[d.lineIndex].thisPoint.y
                            this.lines.add(null, l, this.i - 1, this.prevPoint)
                        }
                    }
                }
            })
        }
        if (this.hLineDirectives.length > 0) {
            this.hLineDirectives.forEach((d, i) => {
                if (d.condition == 'lt' && h < d.value && d.action == 'fork') {
                    if (this.lines.id[d.lineIndex]) {
                        if (this.lines.id[d.lineIndex].k > 0)
                            // New extremum found
                            this.lines.add(h, null, this.i - 1, this.prevPoint, d.lineIndex)
                        else {
                            this.lines.id[d.lineIndex].forked = true
                            this.lines.id[d.lineIndex].forkedAt = this.lines.id[d.lineIndex].thisPoint.x
                            this.lines.id[d.lineIndex].forkedValue = this.lines.id[d.lineIndex].thisPoint.y
                            this.lines.add(h, null, this.i - 1, this.prevPoint)
                        }
                    }
                }
            })
        }
        // Update lines and get future directives
        this.hLineDirectives.length = 0
        this.lLineDirectives.length = 0
        if (this.lines.list[0].length < 1) {
            this.lines.add(h, null, this.i)
            this.lines.add(null, l, this.i)
        } else {
            let updated
            this.lines.list.forEach(ofLines =>
                ofLines.forEach(lineID => {
                    if (this.lines.id[lineID] && this.lines.id[lineID].type) {
                        updated = null
                        if (this.lines.id[lineID] && this.lines.id[lineID].startPoint.x < this.i) // Skip the case if line was just created. TODO make it gracefully
                            updated = this.lines.update(lineID, h, l, this.i)
                        let type = this.lines.id[lineID].type
                        if (updated)
                            type == 'h' ? this.hLineDirectives.push(updated) : this.lLineDirectives.push(updated)
                    }
                })
            )
        }

        //Delete passed lines
        let toDelete = []
        this.lines.list.forEach(ofLines => {
            if (ofLines) {
                toDelete = []
                ofLines.forEach((lineID, i) => {
                    let thisLine = this.lines.id[ofLines[i]]
                    let prevLine = this.lines.id[ofLines[i - 1]]
                    if (
                        (i > 0 && thisLine && prevLine && thisLine.type == 'h' && thisLine.thisPoint && prevLine.thisPoint.y <= thisLine.thisPoint.y || i > this.env.maxForks) ||
                        (i > 0 && thisLine && prevLine && thisLine.type == 'l' && thisLine.thisPoint && prevLine.thisPoint.y >= thisLine.thisPoint.y || i > this.env.maxForks)
                    ) {
                        toDelete.push(lineID)
                    }
                })
                toDelete.forEach(lineID => this.lines.delete(lineID))
            }
        })
        this.prevPoint = {
            x: this.i,
            h: h,
            l: l
        }
        // Estimate trend
        this.trend.update(this.lines.list[0], this.lines.list[1])
        this.i++

        // Return result
        return this.lines;
    }

}
