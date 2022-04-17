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
    public forkDiffH: number = null
    public forkDiffL: number = null
    constructor(step) {
        this.step = step
        this.list = [[], []]
        this.id = {}
    }

    add(h: number, l: number, i: number, prevPoint = null, lineID = null) {
        // Если lineID определена - это экстремум
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
            // Сохраняем прежнюю точку ветвления или берем предыдущую
            holdLastForkY = this.id[curIndex].lastForkY || ( h != null ? prevPoint.h : prevPoint.l)
        }
        this.id[curIndex] = new LineModel(h, l, i, this.step, curIndex, prevPoint)
        // Restore lastForkY from previous state
        if (holdLastForkY){
            this.id[curIndex].lastForkY = holdLastForkY
        }

        /**
         * Метод 3. Ищем последовательность: fork, rollback, fork, trade, wait same on opposite side
         */


        /**
         * Метод 2. Для линии в начале ее ветвления сохраняем y и сравниваем. Сигнализируем, когда разница больше или меньше нуля
         * Метод дает слишком много сигналов из которых сложно выделить значимые. Стоит поискать более эффективный метод поиска разворота
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
        delete this.id[lineID]
    }
}
