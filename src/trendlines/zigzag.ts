export type ZPoint = {
    y: number
    x: number
    i: number // index
}
export type ZLine ={
    d: string
    t: number   // Длительность
    a: number   // Амплитуда
    ap: number
    c: number   // Updates counter
}
export class Zigzag {
    public points: ZPoint[]
    public lines: ZLine[]
    private counter: number
    constructor(x: number, y: number) {
        let i = 0
        this.points = [{ x, y, i}]
        this.counter = 0
    }
    update(x, y) {
        let i = this.counter
        if (x == 1) {
            // Second point
            this.points.push({ x, y, i})
        } else {
            const lastEl = this.points[this.points.length - 1]
            const prevEl = this.points[this.points.length - 2]
            let delta = (y - lastEl.y) * (lastEl.y - prevEl.y)
            if (delta >= 0) {
                // Продляем тренд
                this.points[this.points.length - 1].x = x
                this.points[this.points.length - 1].y = y
            } else {
                this.points.push({ x, y, i})
            }
            // Проверяем превышение амплитуды
            this.points = this.points.filter((el, i) => {
                if (this.points.length < 3 || i == this.points.length - 1 || i == 0) {
                    return true;
                }
                else {
                    let rez = (Math.abs(this.points[i - 1].y - this.points[i].y) >= Math.abs(this.points[i].y - this.points[i + 1].y)) ? true : false;
                    if (this.points.length > 3 && i != this.points.length - 2){
                        let rez2 = (Math.abs(this.points[i].y - this.points[i+1].y) >= Math.abs(this.points[i+1].y - this.points[i + 2].y)) ? true : false;
                        rez = rez && rez2
                    }
                    return rez
                }
            });
        }
    this.lines = []
    this.points.forEach((point, i) => {
        if (i < this.points.length - 1){
            let d = (this.points[i+1].y - this.points[i].y) > 0 ? "r" : "f"
            let t = this.points[i+1].x - this.points[i].x
            let a = Math.abs(this.points[i+1].y - this.points[i].y)
            let c = this.points[i+1].i - this.points[i].i
            let ap = 0
            if (this.lines.length > 0){
                ap = a * 100 / this.lines[0].a
            }
            this.lines.push({d, t, a, ap, c})
            this.lines[0].ap = 100
        }
    })
    this.counter ++
    }

}
