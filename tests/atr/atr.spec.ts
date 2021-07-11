import { ATR } from '../../src/atr';
import { ATR as ATR2 } from 'technicalindicators';
import { atrValues, ohlc } from './excel-data';

describe('ATR', () => {
    it('Excel Validate', () => {
        const atr = new ATR();
        ohlc.forEach((tick, idx) => {
            const calculated = atr.nextValue(tick.h, tick.l, tick.c);
            const excel = atrValues[idx];

            if (!excel && !calculated) {
                expect(excel).toEqual(calculated);
            } else {
                expect(Math.abs(calculated - excel)).toBeLessThan(0.007);
            }
        });
    });

    it('Cross sdk validate', () => {
        ohlc.forEach((tick) => {
            const atr = new ATR(14);
            const atr2 = new ATR2({ period: 14, high: [], low: [], close: [] });
            const local = atr.nextValue(tick.h, tick.l, tick.c);
            const cross = atr2.nextValue({ high: tick.h, low: tick.l, close: tick.c });

            expect(local).toEqual(cross);
        });
    });
});
