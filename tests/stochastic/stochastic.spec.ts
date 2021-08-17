import { Stochastic } from '../../src/stochastic';
import { Stochastic as Stochastic2 } from 'technicalindicators';
import { ohlc, stochValues } from './excel-data';

describe('Stochastic Oscillator', () => {
    it('Excel Validate', () => {
        const st = new Stochastic();
        const EPSILON = 0.0001;

        ohlc.forEach((tick, idx) => {
            const calculated = st.nextValue(tick.h, tick.l, tick.c);
            const excel = stochValues[idx];

            if (calculated?.k && excel?.k) {
                expect(Math.abs(calculated?.k - excel?.k)).toBeLessThan(EPSILON);
            }

            if (calculated?.d && excel?.d) {
                expect(Math.abs(calculated?.d - excel?.d)).toBeLessThan(EPSILON);
            }
        });
    });

    it('Cross Validate', () => {
        const st = new Stochastic();
        const st2 = new Stochastic2({
            period: 14,
            low: [],
            high: [],
            close: [],
            signalPeriod: 3,
        });

        ohlc.forEach((tick) => {
            const calculated = st.nextValue(tick.h, tick.l, tick.c);
            const cross = st2.nextValue({
                high: [tick.h],
                low: [tick.l],
                close: [tick.c],
                period: 14,
                signalPeriod: 3,
            });

            if (calculated?.k && cross?.k) {
                expect(Math.abs(calculated.k - cross.k)).toBeLessThan(0.01);
            }

            if (calculated?.d && cross?.d) {
                expect(Math.abs(calculated.d - cross.d)).toBeLessThan(0.01);
            }
        });
    });
});
