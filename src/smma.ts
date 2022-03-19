/**
 * SMMA (Smoothed Moving Average) is another popular and widely used moving average indicator.
 * As all the other moving average indicators, to achieve the goals, the indicator filters
 * out the market fluctuations (noises) by averaging the price values of the periods, over which it is calculated.
 */
export class SMMA {
    private sum = 0;
    private avg = 0;
    private filled = false;
    private fill = 0;

    constructor(private period: number) {}

    nextValue(value: number) {
        if (this.filled) {
            this.nextValue = (value: number) => (this.avg = (this.avg * (this.period - 1) + value) / this.period);
            return this.nextValue(value);
        }

        this.sum += value;
        this.fill++;

        if (this.fill === this.period) {
            this.filled = true;
            this.avg = this.sum / this.period;

            return this.avg;
        }
    }

    momentValue(value: number) {
        if (!this.filled) {
            return;
        }

        return (this.avg * (this.period - 1) + value) / this.period;
    }
}
