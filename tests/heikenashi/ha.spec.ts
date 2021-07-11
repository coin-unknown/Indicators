import { haValues, ohlc } from './excel-data';
import { HeikenAshi } from '../../src/heiken-ashi';
import { HeikinAshi as HeikenAshi2 } from 'technicalindicators';

describe('Heiken Ashi', () => {
    it('Excel Validate', () => {
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

    it.skip('Cross SDK Validate', () => {
        const ha = new HeikenAshi();
        const ha2 = new HeikenAshi2({ open: [], high: [], low: [], close: [] });

        ohlc.forEach((tick) => {
            const calculated = ha.nextValue(tick.o, tick.h, tick.l, tick.c);
            const cross = ha2.nextValue({ open: tick.o, high: tick.h, low: tick.l, close: tick.c });

            expect(calculated.o).toEqual(cross.open);
            expect(calculated.h).toEqual(cross.high);
            expect(calculated.l).toEqual(cross.low);
            expect(calculated.c).toEqual(cross.close);
        });
    });
});
