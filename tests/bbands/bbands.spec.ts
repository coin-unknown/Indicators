import { BollingerBands } from '../../src/bands';
import { BollingerBands as BollingerBands2 } from 'technicalindicators';
import { bbandsValues, ohlc } from './excel-data';

describe('Bollinger Bands', () => {
    it('Excel Validate', () => {
        const bb = new BollingerBands(20);
        const EPSILON = 0.009;

        ohlc.forEach((tick, idx) => {
            const calculated = bb.nextValue(tick.c);
            const excel = bbandsValues[idx];

            if (!excel && !calculated) {
                expect(excel).toEqual(calculated);
            } else {
                expect(Math.abs(calculated.upper - excel.upper)).toBeLessThan(EPSILON);
                expect(Math.abs(calculated.middle - excel.middle)).toBeLessThan(EPSILON);
                expect(Math.abs(calculated.lower - excel.lower)).toBeLessThan(EPSILON);
            }
        });
    });

    it('Cross sdk validate', () => {
        ohlc.forEach((tick) => {
            const bb1 = new BollingerBands(20);
            const bb2 = new BollingerBands2({ period: 14, stdDev: 2, values: [] });
            const local = bb1.nextValue(tick.c);
            const cross = bb2.nextValue(tick.c);

            expect(local?.lower).toEqual(cross?.lower);
            expect(local?.middle).toEqual(cross?.middle);
            expect(local?.upper).toEqual(cross?.upper);
        });
    });
});
