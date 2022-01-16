import { LineEvent, LineDirective, Point } from './types'
import { LineModel } from './line.model'

/**
 * Trend state Model
 * The trendModel object use Lines and lineDirectives to estimate current trend state
 */
export class TrendStateModel {
    in: {                                                                         // longer state
        state: null | 'unknown' | 'flat' | 'rise' | 'fall' | 'squeeze',
        lineIndex: number | null,
        line: LineModel | null
    }
    is: {                                                                         // current state
        state: null | 'unknown' | 'flat' | 'rise' | 'fall',
        lineIndex: number | null,
        line: LineModel | null
    }
    was: {                                                                       // prevues state
        state: null | 'flat' | 'rise' | 'fall',
        lineIndex: number,
        line: LineModel | null
    }
    width: number                                           // longer state trend width
    speed: number                                           // longer state trend speed
    at: number                                              // time ago of the prevues state
    duration: number                                        // duration of the trend
    kdiff: number[] = []
    projection: number
    lines
    constructor(lines) {
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
        this.was = null
        this.at = 0
    }
    update(lLinesIDs: number[], hLinesIDs: number[]) {
        //Wait for the first tern
        //Init
        /**
         * Базовый алгоритм
         * Головная линия не определена.
         * 1. Появилась первая длительная линия.
         * 2. Линия кончилась, есть противоположная линия то сломанную линию в was (точки начала и конца), меняем is на новую линию
         * Иначе пропускаем этот шаг, ждем восстановления линии и следующего пробития.
         * 3. Ждем конца этого тренда (встречное движение), если есть противоположная линия, то сломанная линия в was, меняем is,
         * устанавливаем in в состояние по новой линии.
         * Иначе пропускаем этот шаг, ждем восстановления линии и следующего пробития.
         */
         let hlMaxDuration = Math.max(...lLinesIDs.map(lineID => this.lines.id[lineID] ? this.lines.id[lineID].length : 0));
         let llMaxDuration = Math.max(...lLinesIDs.map(lineID => this.lines.id[lineID] ? this.lines.id[lineID].length : 0));

        if (!this.is.state && !this.was.state) {
            // Возьмем минимальную длительность тренда = 10 свечам
            this.is.state = llMaxDuration > 10 && hlMaxDuration < 10 ? 'fall' //hLines
                : (hlMaxDuration > 10 && llMaxDuration < 10 ? 'rise' : null)
            if (this.is.state) {
                this.is.line = this.lines.list[this.is.state == 'fall' ? 0 : 1].filter(lineID => this.lines[lineID].length == hlMaxDuration)[0]
                this.is.lineIndex = this.is.line.index
            }
        }
        if (this.is.state && !this.was.state) {

        }

    }
}
