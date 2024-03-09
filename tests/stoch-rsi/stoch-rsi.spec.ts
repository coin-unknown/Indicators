import { ohlc } from './excel-data';
import { StochasticRSI } from '../../src/stochastic-rsi';
import { StochasticRSI as StochasticRSITI } from 'technicalindicators';

describe('StochRSI', () => {
    it('Cross sdk validate', () => {
        const configTI = { stochasticPeriod: 14, rsiPeriod: 14, kPeriod: 3, dPeriod: 3, values: [] as number[] };
        const stochRsi = new StochasticRSI();
        const stochRsi2 = new StochasticRSITI(configTI);

        ohlc.forEach((tick) => {
            configTI.values.push(tick.c);
            const local = stochRsi.nextValue(tick.c);
            //@ts-expect-error incorrect typings
            const cross = stochRsi2.nextValue(tick.c);

            if (local?.k && cross?.k) {
                //precision issues with technicalindicators setConfig('precision') is not work as expected
                expect(Math.abs(local.k - cross.k)).toBeLessThan(0.05);
                expect(Math.abs(local.d - cross.d)).toBeLessThan(0.05);
                expect(Math.abs(local.stochRsi - cross.stochRSI)).toBeLessThan(0.05);
            }
        });
    });
});
