import { LineEvent, LineDirective, Point } from './types'
import { LineModel } from './line.model'

/**
 * Lines Model class.
 * this.index - index in lineDirectives array
 */
export class LinesModel {
    list: [number[], number[]]  // [h: l]
    id: {
        [id: string]: LineModel
    }
    lineIndex: number = 0
    state: number = 0
    public tradeLineID: number = null
    public trendLineType: string = null
    private step: number        // Step of time in minutes
    constructor(step) {
        this.step = step
        this.list = [[], []]
        this.id = {}
    }

    add(h: number, l: number, i: number, lineID = null, prevPoint = null): number {
        let curIndex
        if (lineID == null) {
            curIndex = this.lineIndex
            this.lineIndex++
            if (h != null)
                this.list[0].push(curIndex)
            else
                this.list[1].push(curIndex)
        } else
            curIndex = lineID
        this.id[curIndex] = new LineModel(h, l, i, this.step, curIndex, lineID != null ? prevPoint : null)
        if (curIndex > 1 && this.id[curIndex].type != this.trendLineType) {
            // get prevues line
            let id = this.list[this.id[curIndex].type == 'h' ? 0 : 1][this.list[this.id[curIndex].type == 'h' ? 0 : 1].indexOf(curIndex) - 1]
            if ((this.id[curIndex].type == 'h' && this.tradeLineID == null && this.id[id] && this.id[curIndex].thisPoint.y + 1 < this.id[id].thisPoint.y)
                || this.id[curIndex].type == 'l' && this.trendLineType == 'h') {
                this.trendLineType = this.id[curIndex].type
                this.state = this.id[curIndex].type == 'h' ? -1 : 1
                this.tradeLineID = curIndex
            }
        }
        return curIndex
    }

    update(lineID, h, l, t) {
        return this.id[lineID].update(h, l, t)
    }

    delete(lineID) {
        if (!this.id[lineID]) return
        if (this.id[lineID].type == 'h')
            this.list[0].splice(this.list[0].indexOf(lineID), 1)
        else
            this.list[1].splice(this.list[1].indexOf(lineID), 1)
        /*         if (this.tradeLineID != null && lineID == this.tradeLineID && this.id[lineID].type != 'h')
                    this.state = this.id[lineID].type == 'h' ? 1 : -1 */
        delete this.id[lineID]
    }
}
