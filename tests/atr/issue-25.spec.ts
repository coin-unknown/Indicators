import { ATR } from '../../src/atr';
import { ohlc } from './excel-data';

let closes = [
    51.59,
    51.65,
    51.65,
    51.65,
    51.65,
    51.65,
    51.65,
    51.65,
    51.65,
    51.65,
    51.65,
    51.65,
    51.65,
    51.65,
    51.65,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
    51.6,
];

describe('ATR', () => {
    it('issue-25: ATR sometimes return undefined value', () => {
        const atr = new ATR()

        ohlc.forEach((candle, index)  => {
            atr.nextValue(candle.h, candle.l, candle.c);
        });

        closes.forEach((close) => {
            const value = atr.nextValue(close, close, close);

            expect(value).toBeDefined();
        });

    });
});
