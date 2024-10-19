import { AMA } from '../../src/ama';
import { data } from './data';

describe('Adaptive Moving Average', () => {
    const ama = new AMA(15, 2, 30);
    const EPSILON = 0.001;

    it('Excel validate', () => {
        data.forEach((tick, idx) => {
            const amaValue = ama.nextValue(tick.c);
            const expected = Number(tick.ama);

            if (amaValue && expected) {
                expect(Math.abs(amaValue - expected)).toBeLessThan(EPSILON);
            }

        });
    });
});
