import { RMA } from "../rma";

export class LevelRMA {

    private rma1: RMA;
    private rma2: RMA;
    private rma3: RMA;
    private rma4: RMA;
    private rma5: RMA;
    private rma6: RMA;

    private upper = 0;
    private lower = 0;
    private lastUpperValue = 0;
    private lastLowerValue = 0;

    constructor(public period: number, public rmaCount: number, public redunant = 0.85) {
        this.rma1 = new RMA(period);
        this.rma2 = new RMA(period);
        this.rma3 = new RMA(period);
        this.rma4 = new RMA(period);
        this.rma5 = new RMA(period);
        this.rma6 = new RMA(period);
    }

    public nextValue(value: number) {
        if (value > 0) {
            this.upper = this.getUp(value);
            this.lastLowerValue *= this.redunant;
            this.lower = this.getDown(this.lastLowerValue);
            this.lastUpperValue = value;
        } else if (value < 0) {
            this.lower = this.getDown(value);
            this.lastUpperValue *= this.redunant;
            this.upper = this.getUp(this.lastUpperValue);
            this.lastLowerValue = value;
        }

        return { upper: this.upper, lower: this.lower };
    }

    public getUp(value: number) {
        const rma1 = this.rma1.nextValue(value);
        let rma2: number | null = null;

        if (this.rmaCount === 1) {
            return rma1;
        }

        if (rma1) {
            rma2 = this.rma2.nextValue(rma1);
        }

        if (this.rmaCount === 2) {
            return rma2;
        }

        if (rma2) {
            return this.rma3.nextValue(rma2);
        }

        return null;
    }

    public getDown(value: number) {
        const rma4 = this.rma4.nextValue(value);
        let rma5: number | null = null;

        if (this.rmaCount === 1) {
            return rma4;
        }

        if (rma4) {
            rma5 = this.rma5.nextValue(rma4);
        }

        if (this.rmaCount === 2) {
            return rma5;
        }

        if (rma5) {
            return this.rma6.nextValue(rma5);
        }

        return null;
    }
}
