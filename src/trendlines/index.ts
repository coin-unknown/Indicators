import { LineModel } from './line.model'
import { LinesModel } from './lines.model'
import { LineEvent, LineDirective, Point } from './types'
import { TrendStateModel } from './trend.model'

export type { LinesModel, TrendStateModel };
export class Indicator {
    public hLineDirectives: LineDirective[] = []
    public lLineDirectives: LineDirective[] = []
    private hLineIndex: number = 1
    private lLineIndex: number = 1
    public trend: TrendStateModel
    private hLines: LineModel[]
    private lLines: LineModel[]
    private lines: LinesModel
    private step: number = 1        // TODO operate in different time scale
    private i: number = 0
    // Settings
    private slidingMethod: number = 0   // Set draw method: 0 - not sliding TL, 1 -sliding TL, 2 - states
    private maxForks = 10               // Forks of line
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
     * @param maxForks
     * @param slidingMethod
     * @param minLog
     * @param maxLog
     */
    constructor(maxForks = 10, slidingMethod = 1, minLog = 0, maxLog = 10) {
        this.maxForks = maxForks
        this.slidingMethod = slidingMethod
        this.minLog = minLog
        this.maxLog = maxLog
        this.lines = new LinesModel(this.step)
        this.trend = new TrendStateModel(this.lines)
    }

    log(title, ...data) {
        this.consoleWindow = this.minLog < this.localCounter && this.localCounter < this.maxLog
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
        // Debug only
        let scale = {
            y: 1000,
            k: 20
        }
        let scaleState = {
            y: 2780,
            delta: 20
        }
        this.localCounter++

        // Apply line directives got on prevues step
        if (this.lLineDirectives.length > 0) {
            // TODO Fork only last line in Array
            this.lLineDirectives.forEach((d, i) => {
                if (d.condition == 'gt' && l > d.value && d.action == 'fork') {
                    if (this.lines.id[d.lineIndex]) {
                        this.lines.id[d.lineIndex].forked = true
                        if (d.lineIndex != undefined && this.lines.id[d.lineIndex] != undefined && this.lines.id[d.lineIndex].k < 0)
                            this.lines.add(null, l, this.i, d.lineIndex, this.prevPoint) // New extremum found
                        else
                            this.lines.add(null, l, this.i)
                    }
                }
            })
        }
        if (this.hLineDirectives.length > 0) {
            this.hLineDirectives.forEach((d, i) => {
                if (d.condition == 'lt' && h < d.value && d.action == 'fork') {
                    if (this.lines.id[d.lineIndex]) {
                        this.lines.id[d.lineIndex].forked = true
                        if (this.lines.id[d.lineIndex].k > 0)
                            this.lines.add(h, null, this.i, d.lineIndex, this.prevPoint) // New extremum found
                        else
                            this.lines.add(h, null, this.i)
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
                        // Deprecated
                        if ((type == 'h' && this.lines.id[lineID].thisPoint.y > h * 1.2) || (type == 'l' && this.lines.id[lineID].thisPoint.y < l * 0.8))
                            this.lines.delete(lineID)
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
                        (i > 0 && thisLine && prevLine && thisLine.type == 'h' && thisLine.thisPoint && prevLine.thisPoint.y <= thisLine.thisPoint.y || i > this.maxForks) ||
                        (i > 0 && thisLine && prevLine && thisLine.type == 'l' && thisLine.thisPoint && prevLine.thisPoint.y >= thisLine.thisPoint.y || i > this.maxForks)
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
