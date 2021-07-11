import { haValues, ohlc } from './excel-data';
import { HeikenAshi } from '../../src/heiken-ashi';

describe('Heiken Ashi', () => {
    it.only('Excel Validate', () => {
        const ha = new HeikenAshi();

        ohlc.forEach((tick, idx) => {
            const calculated = ha.nextValue(tick.o, tick.h, tick.l, tick.c);
            const excel = haValues[idx];
            const EPSILON = 0.01;

            expect(Math.abs(calculated.o - excel.o)).toBeLessThan(EPSILON);
            expect(Math.abs(calculated.h - excel.h)).toBeLessThan(EPSILON);
            expect(Math.abs(calculated.l - excel.l)).toBeLessThan(EPSILON);
            expect(Math.abs(calculated.c - excel.c)).toBeLessThan(EPSILON);
        });
    });
});
