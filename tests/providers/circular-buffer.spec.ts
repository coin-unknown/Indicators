import { CircularBuffer } from '../../src/providers/circular-buffer';

describe('Circular buffer', () => {
    it('for each', () => {
        const buffer = new CircularBuffer(6);
        const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
        const result = [8, 9, 10, 11, 12, 13];

        data.forEach((item) => buffer.push(item));

        buffer.forEach((item, idx) => {
            // console.log(item, idx);
            expect(item).toEqual(result[idx]);
        });
    });
});
