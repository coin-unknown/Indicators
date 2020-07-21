// console.log(sma([1, 2, 3, 4, 5, 6, 7, 8, 9], 4));
//=> [ '2.50', '3.50', '4.50', '5.50', '6.50', '7.50' ]
//=>   │       │       │       │       │       └─(6+7+8+9)/4
//=>   │       │       │       │       └─(5+6+7+8)/4
//=>   │       │       │       └─(4+5+6+7)/4
//=>   │       │       └─(3+4+5+6)/4
//=>   │       └─(2+3+4+5)/4
//=>   └─(1+2+3+4)/4

import { avg } from '../utils';

export class SMA {
    private arr: number[] = [];

    constructor(private period: number) {}

    nextValue(value: number) {
        if (this.arr.length === this.period) {
            this.arr.shift();
        }

        this.arr.push(value);

        if (this.arr.length < this.period) {
            return;
        }

        return avg(this.arr, this.period);
    }
}
