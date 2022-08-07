
import { ohlc, trueRangeData, averageTrueRrange } from './data';
import { getTrueRange } from '../../src/providers/true-range';
import { ATR } from '../../src/atr';

describe("True Range", () => {
    it('Excel validation test', () => {
        let prevClose: number;

        ohlc.forEach((tick, idx) => {
            const calculated = getTrueRange(tick.h, tick.l, prevClose);
            const excel = trueRangeData[idx];

            if (excel && calculated) {
                const diff = Math.abs(calculated - excel);

                expect(diff).toBeLessThan(0.00001);
            }

            prevClose = tick.c;
        });
    });

    it('ATR for true range validation test', () => {
        const atr = new ATR(10, 'SMA');

        ohlc.forEach((tick, idx) => {
            const calculated = atr.nextValue(tick.h, tick.l, tick.c);
            const excel = averageTrueRrange[idx];

            if (excel && calculated) {
                const diff = Math.abs(calculated - excel);

                expect(diff).toBeLessThan(0.00001);
            }
        });
    });
});
