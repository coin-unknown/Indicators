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
    private filled = false;

    constructor(private period: number) {}

    nextValue(value: number) {
        this.filled = this.filled || this.arr.length === this.period;
        this.arr.push(value);

        if (this.filled) {
            this.sum -= this.arr.shift();
            this.sum += value;

            return this.sum / this.period;
        }

        this.sum += value;
    }

    momentValue(value: number) {
        if (!this.filled) {
            return;
        }

        let rmValue: number = this.arr[0];
        let sum = this.sum;

        sum -= rmValue;
        sum += value;

        return sum / this.period;
    }
}
