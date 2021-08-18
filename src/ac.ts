import { SMA } from './sma';
import { AO } from './ao';

/**
 The Accelerator Oscillator (AC indicator) is a technical analysis tool that helps
 to gauge the momentum in the market. It also helps to predict when the momentum will change.
 */

export class AC {
    private sma: SMA;
    private ao: AO;
    private smaValue: number;
    private aoValue: number;

    constructor() {
        this.sma = new SMA(5);
        this.ao = new AO();
    }

    nextValue(high: number, low: number) {
        this.aoValue = this.ao.nextValue(high, low);

        if (this.aoValue === undefined) {
            return;
        }

        this.smaValue = this.sma.nextValue(this.aoValue);

        if (this.smaValue === undefined) {
            return;
        }

        return this.aoValue - this.smaValue;
    }

    momentValue(high: number, low: number) {
        const aoValue = this.ao.momentValue(high, low);

        if (aoValue === undefined) {
            return;
        }

        const smaValue = this.sma.momentValue(aoValue);

        if (smaValue === undefined) {
            return;
        }

        return aoValue - smaValue;
    }
}
