/**
 * SMMA (Smoothed Moving Average) is another popular and widely used moving average indicator.
 * As all the other moving average indicators, to achieve the goals, the indicator filters
 * out the market fluctuations (noises) by averaging the price values of the periods, over which it is calculated.
 */
export class SMMA {
    private sum = 0;
    private filled = false;
    private fill = 0;

    constructor(private period: number) {}

    nextValue(value: number) {
        if (this.filled) {
            return (this.sum = (this.sum * (this.period - 1) + value) / this.period);
        }

        this.sum += value;
        this.fill++;
        this.filled = this.fill === this.period;
    }

    momentValue(value: number) {
        if (!this.filled) {
            return;
        }

        return (this.sum * (this.period - 1) + value) / this.period;
    }
}
