import { WEMA as WEMA1 } from 'technicalindicators';
import { WEMA as WEMA2 } from '../../src/wema';
import { ohlc } from './data';

describe("Wilder's Smoothed Moving Average", () => {
    it('Cross validate', () => {
        const cross = new WEMA1({ period: 6, values: [] });
        const local = new WEMA2(6);

        ohlc.forEach((tick, idx) => {
            const calcValue = cross.nextValue(tick.c);
            const crossValue = local.nextValue(tick.c);

            if (idx > 6) {
                expect(calcValue).toEqual(crossValue);
            }
        });
    });
});
