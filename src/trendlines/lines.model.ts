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
    private step: number        // Step of time in minutes
    constructor(step) {
        this.step = step
        this.list = [[],[]]
        this.id = {}
    }

    add(h: number, l: number, i: number, lineID = null): number {
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
        this.id[curIndex] = new LineModel(h, l, i, this.step, curIndex)
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
            this.list[1].splice(this.list[0].indexOf(lineID), 1)
        delete this.id[lineID]
    }
}
