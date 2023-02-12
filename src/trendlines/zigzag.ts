import { Env } from "./types"

export type ZPoint = {
    y: number
    x: number
    i: number // index
}
export type ZLine = {
    d: string
    t: number   // Длительность
    a: number   // Амплитуда
    ap: number
    c: number   // Updates counter
}
/**
 * ZigZag interactive
 * https://www.investopedia.com/terms/z/zig_zag_indicator.asp
 * (The classical Zag indicator plots points on a chart whenever prices reverse by a percentage greater than a pre-chosen variable. Straight lines are then drawn, connecting these points.)
 */
export class ZigZagI {
    public points: ZPoint[]
    public lines: ZLine[]
    private counter: number
    public accuracy: number
    protected env: Env
    constructor(x: number, y: number, env: Env) {
        let i = 0
        this.env = env
        this.points = [{ x, y, i }]
        this.counter = 0
        this.accuracy = 10000
    }
    update(x, y) {
        let i = this.counter
        if (x == 1) {
            // Second point
            this.points.push({ x, y, i })
        } else {
            const lastEl = this.points[this.points.length - 1]
            const prevEl = this.points[this.points.length - 2]
            let delta = (y - lastEl.y) * (lastEl.y - prevEl.y)
            if (delta >= 0) {
                // Продляем тренд
                this.points[this.points.length - 1].x = x
                this.points[this.points.length - 1].y = y
            } else {
                this.points.push({ x, y, i })
            }
            // Проверяем превышение амплитуды
            let direction = this.points[this.points.length - 1].y > this.points[this.points.length - 2].y ? "r" : "f";
            let delEl = null;
            if (this.points.length > 2) {
                for (var ind = this.points.length - 3; ind >= 0; ind -= 2) {
                    if (this.points[this.points.length - 1].x - this.points[ind].x < this.env.zigZagMinTime) {
                        let diff = this.points[this.points.length - 1].y - this.points[ind].y;
                        let cond = diff > 0
                        if (diff != 0 && (direction == "f" ? !cond : cond)) {
                            delEl = ind;
                        }
                        if (delEl == 0) delEl = 1
                    }
                }
            }
            if (delEl) {
                this.points[delEl] = this.points[this.points.length - 1]
                this.points = this.points.filter((el, index) => index <= delEl)
            }
        }
        this.lines = []
        this.points.forEach((thePoint, i) => {
            if (i < this.points.length - 1) {
                const nextPoint = this.points[i + 1]
                let d = (nextPoint.y - thePoint.y) > 0 ? "r" : "f"
                let t = nextPoint.x - thePoint.x
                let a = Math.round(Math.abs(nextPoint.y - thePoint.y) * this.accuracy) / this.accuracy
                let c = nextPoint.i - thePoint.i
                let ap = 100
                if (this.lines.length > 1) {
                    ap = Math.round(a * 10000 / this.lines[0].a) / 100
                }
                this.lines.push({ d, t, a, ap, c })
            }
        })
        this.counter++
    }

}
