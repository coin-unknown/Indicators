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
    private aoValue: {
        smaSlowValue: number;
        smaFastValue: number;
        ao: number;
    };

    constructor() {
        this.sma = new SMA(5);
        this.ao = new AO();
    }

    nextValue(high: number, low: number) {
        this.aoValue = this.ao.nextValue(high, low);
        this.smaValue = this.sma.nextValue(this.aoValue.ao);

        return this.aoValue.ao - this.smaValue;
    }

    momentValue(high: number, low: number) {
        const aoValue = this.ao.momentValue(high, low);
        const smaValue = this.sma.momentValue(aoValue.ao);

        return aoValue.ao - smaValue;
    }
}
