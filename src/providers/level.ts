import { RMA } from '../rma';
import { EMA } from '../ema';
import { SMA } from '../sma';

export class Level {
    private sample1Up: RMA | SMA | EMA;
    private sample2Up: RMA | SMA | EMA;
    private sample3Up: RMA | SMA | EMA;
    private sample1Low: RMA | SMA | EMA;
    private sample2Low: RMA | SMA | EMA;
    private sample3Low: RMA | SMA | EMA;

    private upper = 0;
    private lower = 0;
    private lastUpperValue = 0;
    private lastLowerValue = 0;

    constructor(
        public period: number,
        public samples: number,
        public redunant = 0.85,
        private type: 'RMA' | 'EMA' | 'SMA' = 'RMA',
    ) {
        this.sample1Up = this.createSample();
        this.sample2Up = this.createSample();
        this.sample3Up = this.createSample();
        this.sample1Low = this.createSample();
        this.sample2Low = this.createSample();
        this.sample3Low = this.createSample();
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
        const sample1 = this.sample1Up.nextValue(value);
        let sample2: number | null = null;

        if (this.samples === 1) {
            return sample1;
        }

        if (sample1) {
            sample2 = this.sample2Up.nextValue(sample1);
        }

        if (this.samples === 2) {
            return sample2;
        }

        if (sample2) {
            return this.sample3Up.nextValue(sample2);
        }

        return null;
    }

    public getDown(value: number) {
        const sample1 = this.sample1Low.nextValue(value);
        let sample2: number | null = null;

        if (this.samples === 1) {
            return sample1;
        }

        if (sample1) {
            sample2 = this.sample2Low.nextValue(sample1);
        }

        if (this.samples === 2) {
            return sample2;
        }

        if (sample2) {
            return this.sample3Low.nextValue(sample2);
        }

        return null;
    }

    private createSample() {
        switch (this.type) {
            case 'EMA':
                return new EMA(this.period);
            case 'RMA':
                return new RMA(this.period);
            case 'SMA':
                return new SMA(this.period);
        }
    }
}
