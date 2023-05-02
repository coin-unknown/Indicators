export interface IndicatorInstance {
    nextValue: (value: number) => number;
    momentValue: (value: number) => number;
}

export interface IndicatorConstructor {
    new (...args: any[]): IndicatorInstance;
}

/**
 * Sampler class for using with simple indicators like SMA, EMA, which nextValue arguments is number and
 * return type also number. Can be user for replace SMA(SMA(SMA(SMA))) calls (sma x4 sample)
 */
export class Sampler<T extends IndicatorConstructor> {
    private _indicators: IndicatorInstance[] = [];

    constructor(private indicator: T, private samples: number) {}

    /**
     * Create indicator instances for next usage, pass period and other
     * indicator constructor parameters
     */
    create(...args: ConstructorParameters<T>) {
        for (let i = 0; i < this.samples; i++) {
            this._indicators.push(new this.indicator(...args));
        }
    }

    /**
     * Calculate next values to get all samples of current idicator
     */
    nextValue(value: number): number {
        for (let i = 0; i < this.samples; i++) {
            value = this._indicators[i].nextValue(value);

            if (value === undefined) {
                return value;
            }
        }

        return value;
    }

    /**
     * Get immediate value
     */
    momentValue(value: number): number {
        for (let i = 0; i < this.samples; i++) {
            value = this._indicators[i].momentValue(value);

            if (value === undefined || value === null) {
                return value;
            }
        }

        return value;
    }
}
