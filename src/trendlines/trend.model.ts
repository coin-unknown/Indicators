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
        state: null | 'flat' | 'rise' | 'fall',
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
        this.at = 0
    }

    /**
     * Базовый алгоритм
     * Головная линия не определена.
     * 1. Появилась первая длительная линия.
     * 2. Линия кончилась, есть противоположная линия то сломанную линию в was (точки начала и конца), меняем is на новую линию
     *
     *
     * 3. Ждем конца этого тренда (встречное движение), если есть противоположная линия, то сломанная линия в was, меняем is,
     * устанавливаем in в состояние по новой линии.
     * Иначе пропускаем этот шаг, ждем восстановления линии и следующего пробития.
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
            // Возьмем минимальную длительность тренда = 5 свечей
            let firstTimeFrame = 5
            this.is.line = (this.llMaxDuration && this.llMaxDuration.length > firstTimeFrame && this.hlMaxDuration.length < firstTimeFrame) ? this.llMaxDuration //hLines
                : ((this.hlMaxDuration && this.hlMaxDuration.length > firstTimeFrame && this.llMaxDuration.length < firstTimeFrame) ? this.hlMaxDuration : null)
            if (this.is.line) {
                this.is.lineIndex = this.is.line.index
                this.is.state = this.is.line.type == 'h' ? 'fall' : 'rise'
            }
        }

        if (this.is.state && !this.was.state) {
            if (this.lines.id[this.is.lineIndex].rollback) {
                this.was.state = this.is.state
                if (this.is.state == "fall" ? this.llMaxDuration.length > 1 : this.hlMaxDuration.length > 1) {
                    this.is.line = this.is.state == "fall" ? this.llMaxDuration : this.hlMaxDuration
                    this.is.state = this.is.line.type == 'h' ? 'fall' : 'rise'
                    this.is.lineIndex = this.is.line.index
                }
                this.is.state = this.llMaxDuration.length > 3 && this.hlMaxDuration.length < 3 ? 'fall' //hLines
                    : (this.hlMaxDuration.length > 3 && this.llMaxDuration.length < 3 ? 'rise' : null)
            }
        }
        return [(this.is.state && this.is.state == 'fall') ? 2780 : 2800]
    }
}
