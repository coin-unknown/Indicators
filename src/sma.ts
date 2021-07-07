// console.log(sma([1, 2, 3, 4, 5, 6, 7, 8, 9], 4));
//=> [ '2.50', '3.50', '4.50', '5.50', '6.50', '7.50' ]
//=>   │       │       │       │       │       └─(6+7+8+9)/4
//=>   │       │       │       │       └─(5+6+7+8)/4
//=>   │       │       │       └─(4+5+6+7)/4
//=>   │       │       └─(3+4+5+6)/4
//=>   │       └─(2+3+4+5)/4
//=>   └─(1+2+3+4)/4

export class SMA {
    private arr: number[] = [];
    private sum = 0;

    constructor(private period: number) {}

    nextValue(value: number) {
        this.sum += value;

        const idx = this.arr.push(value);

        if (idx > this.period) {
            this.sum -= this.arr.shift();

            const sma = this.sum / this.period;

            // Filled calculation override
            this.nextValue = (value: number) => {
                this.sum += value;
                this.arr.push(value);
                this.sum -= this.arr.shift();

                return this.sum / this.period;
            };

            return sma;
        }
    }

    momentValue(value: number) {
        const rmValue = this.arr[0];
        let sum = this.sum;

        sum -= rmValue;
        sum += value;

        return sum / this.period;
    }
}
