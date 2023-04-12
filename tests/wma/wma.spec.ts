import { WMA as WMA1 } from 'technicalindicators';
import { WMA as WMA2 } from '../../src/wma';
import { ohlc } from './data';

describe("Wilder's Moving Average", () => {
    it('Cross validate', () => {
        const cross = new WMA1({ period: 6, values: [] });
        const local = new WMA2(6);

        ohlc.forEach((tick) => {
            const crossValue = cross.nextValue(tick.c);
            const localMoment = local.momentValue(tick.c);
            const localValue = local.nextValue(tick.c);

            // console.log(calcValue, crossValue);
            expect(crossValue).toEqual(localValue);
            expect(localMoment).toEqual(localValue);
        });
    });
});
