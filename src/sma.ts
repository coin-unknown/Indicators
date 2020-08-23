import { sum } from './utils';


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
    private sum: number;

    constructor(private period: number, private quick?: boolean) {}

    nextValue(value: number) {
        let rmValue: number;

        if (this.arr.length === this.period) {
            rmValue = this.arr.shift();
        }

        this.arr.push(value);

        if (this.arr.length < this.period) {
            return;
        }

        if (this.sum !== undefined) {
            this.sum -= rmValue;
            this.sum += value;

            return this.sum / this.period;
        }

        this.sum = sum(this.arr);

        return this.sum / this.period;
    }

    momentValue(value: number) {
        if (this.arr.length < this.period) {
            return;
        }

        let rmValue: number;
        let sum = this.sum;

        const arr = this.arr.slice(0);

        if (arr.length === this.period) {
            rmValue = arr.shift();
        }

        arr.push(value);

        if (sum !== undefined) {
            sum -= rmValue;
            sum += value;

            return sum / this.period;
        }
    }
}
