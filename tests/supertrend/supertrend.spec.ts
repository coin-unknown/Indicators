
import { ohlc, stExcelCalculated } from './data';
import { SuperTrend } from '../../src/supertrend';

describe("Super Trend", () => {
    it('Excel validation test', () => {
        const st = new SuperTrend(10, 2, 'SMA');

        ohlc.forEach((tick, idx) => {
            const value = st.nextValue(tick.h, tick.l, tick.c);
            const excel = stExcelCalculated[idx];

            if (value?.upper && excel) {
                const diff = Math.abs(value.upper - excel.upper);

                expect(diff).toBeLessThan(0.00001);
            }
        });
    });
});
