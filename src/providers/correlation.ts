import { SMA } from "../sma";

export class Correlation {
    private pricesX: number[];
    private pricesY: number[];
    private filled: boolean;
    private SMAx: SMA;
    private SMAy: SMA;
    private SMAxValue: number;
    private SMAyValue: number;

    constructor(public period: number) {
        this.SMAx = new SMA(this.period);
        this.SMAy = new SMA(this.period);
        this.pricesX = [];
        this.pricesY = [];
    }

    nextValue(priceX: number, priceY: number) {
        this.filled = this.filled || this.pricesX.length === this.period;
        this.SMAxValue = this.SMAx.nextValue(priceX);
        this.SMAyValue = this.SMAy.nextValue(priceY);

        if (this.filled && this.SMAxValue && this.SMAyValue) {
            this.pricesX.push(priceX);
            this.pricesY.push(priceY);
            this.pricesX.shift();
            this.pricesY.shift();

            let SSxy: number;
            let SSxx: number;
            let SSyy: number;

            for (let i = 0; i < this.period; i++) {
                const xPrice = this.pricesX[i];
                const yPrice = this.pricesY[i];

                SSxy += (xPrice - this.SMAxValue) * (yPrice - this.SMAyValue);
                SSxx += (xPrice - this.SMAxValue) ** 2;
                SSyy += (yPrice - this.SMAyValue) ** 2;
            }

            return SSxy / Math.sqrt(SSxx * SSyy);
        }

    }
}
