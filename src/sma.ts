import { CircularBuffer } from './providers/circular-buffer';
// console.log(sma([1, 2, 3, 4, 5, 6, 7, 8, 9], 4));
//=> [ '2.50', '3.50', '4.50', '5.50', '6.50', '7.50' ]
//=>   │       │       │       │       │       └─(6+7+8+9)/4
//=>   │       │       │       │       └─(5+6+7+8)/4
//=>   │       │       │       └─(4+5+6+7)/4
//=>   │       │       └─(3+4+5+6)/4
//=>   │       └─(2+3+4+5)/4
//=>   └─(1+2+3+4)/4

export class SMA {
    private circular: CircularBuffer;
    private sum = 0;
    private fill = 0;

    constructor(private period: number) {
        this.circular = new CircularBuffer(period);
    }

    nextValue(value: number) {
        this.sum += value;
        this.sum -= this.circular.push(value) || 0;

        this.fill++;

        if (this.fill !== this.period) {
            return;
        }

        this.nextValue = (value: number) => {
            this.sum += value;
            this.sum -= this.circular.push(value) || 0;

            return this.sum / this.period;
        };

        this.momentValue = (value: number) => {
            const rmValue = this.circular.current();

            return (this.sum - rmValue + value) / this.period;
        };

        return this.sum / this.period;
    }

    momentValue(value: number): number {
        return;
    }
}
