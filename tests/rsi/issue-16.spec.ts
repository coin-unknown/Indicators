import { RSI } from '../../src/rsi';
import { RSI as RSI2 } from 'technicalindicators';

let closes = [
    1.59, 1.65, 1.65, 1.65, 1.65, 1.65, 1.65, 1.65, 1.65, 1.65, 1.65, 1.65, 1.65, 1.65, 1.65, 1.6, 1.6, 1.6, 1.6, 1.6,
    1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6,
    1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6,
];

const EPSILON = 0.003;

describe('RSI', () => {
    it('issue-16: Invalid rsi return when avg is zero', () => {
        let rsi = new RSI(14);
        const rsi2 = new RSI2({ period: 14, values: [] });

        closes.forEach((c) => {
            const calculated = rsi.nextValue(c);
            const vendor = rsi2.nextValue(c);

            if (calculated && vendor) {
                expect(Math.abs(calculated - vendor)).toBeLessThan(EPSILON);
            }
        });
    });
});
