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
    public forkDiffH: number = null
    public forkDiffL: number = null
    constructor(step) {
        this.step = step
        this.list = [[], []]
        this.id = {}
    }

    add(h: number, l: number, i: number, prevPoint = null, lineID = null) {
        let curIndex, holdLastForkY = null
        if (lineID == null) {
            curIndex = this.lineIndex
            this.lineIndex++
            if (h != null)
                this.list[0].push(curIndex)
            else
                this.list[1].push(curIndex)
        } else {
            curIndex = lineID
            holdLastForkY = this.id[curIndex].lastForkY
        }
        this.id[curIndex] = new LineModel(h, l, i, this.step, curIndex, lineID == null ? prevPoint : null)
        // Restore lastForkY from previous state
        if (holdLastForkY)
            this.id[curIndex].lastForkY = holdLastForkY
        /**
         * Метод 2. Для линии в начале ее ветвления сохраняем y и сравниваем. Сигнализируем, когда разница больше или меньше нуля
         */
        let sourceLineID, preSourceLineID
        if (curIndex > 1 || (lineID != null && this.id[lineID] != null)) {
            sourceLineID = lineID != null ? lineID : this.list[this.id[curIndex].type == 'h' ? 0 : 1][this.list[this.id[curIndex].type == 'h' ? 0 : 1].indexOf(curIndex) - 1]
            preSourceLineID = lineID != null ? lineID : this.list[this.id[curIndex].type == 'h' ? 0 : 1][this.list[this.id[curIndex].type == 'h' ? 0 : 1].indexOf(curIndex) - 2]
            let lastForkVal = this.id[sourceLineID].lastForkY
            // Если линия только создана, то берем экстремум у предыдущей в массиве линии preSourceLineID
            if (preSourceLineID && !lastForkVal)
                lastForkVal = this.id[preSourceLineID].lastForkY
            let prevForkValue = h != null ? prevPoint.h : prevPoint.l
            if (lastForkVal) {
                if (h)
                    this.forkDiffH = lastForkVal >= prevForkValue ? -sourceLineID - 1 : sourceLineID + 1
                else
                    this.forkDiffL = lastForkVal >= prevForkValue ? -sourceLineID - 1 : sourceLineID + 1
            }
            this.id[sourceLineID].lastForkY = prevForkValue
        }
        /**
         * Пробуем развороты по ветвлению линии.
         * tradeLineID, trendLineType - текущая линия тренда
         * state -1 ... 1
         */
        if (curIndex > 1 && this.id[curIndex].type != this.trendLineType) {
            // get prevues line
            // начнем пока с линии h и расстоянием до первой точки линии ветвления > 1.0
            if (this.id[curIndex].type == 'h'
                ? this.id[curIndex].thisPoint.y + 7 < this.id[sourceLineID].thisPoint.y
                : this.id[sourceLineID].thisPoint.y + 7 < this.id[curIndex].thisPoint.y
            ) {
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
