import { EMA } from '../../src/ema';
import { EMA as EMA2 } from 'technicalindicators';
import { emaValues, closes } from './excel-data';

describe('CCI', () => {
    it('Excel Validate', () => {
        const ema = new EMA(10);

        closes.forEach((c, idx) => {
            const calculated = ema.nextValue(c);
            const excel = emaValues[idx];

            if (!excel && !calculated) {
                expect(excel).toEqual(calculated);
            } else {
                expect(Math.abs(calculated - excel)).toBeLessThan(0.0001);
            }
        });
    });

    it('Cross sdk validate', () => {
        closes.forEach((c) => {
            const ema = new EMA(20);
            const ema2 = new EMA2({ period: 14, values: [] });
            const local = ema.nextValue(c);
            const cross = ema2.nextValue(c);

            expect(local).toEqual(cross);
        });
    });
});
