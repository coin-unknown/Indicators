import { CircularBufferHL } from '../../src/providers/circular-buffer-hl';

describe.skip('Circular buffer High and Low', () => {
    it('for each', () => {
        const buffer = new CircularBufferHL(5);
        const data = [9, 9, 3, 7, 3, 8, 4, 5, 11, 5, 5, 5, 5, 2, 1, 0, 4, 0, 0, 0, 0, 0, 5, 3, 1, 1, 1, 1, 2];
        const result = [8, 9, 10, 11, 12, 13];

        data.forEach((item) => {
            buffer.push(item);
        });

        console.log(buffer.high);

        buffer.forEach((item, idx) => {
            console.log(item, idx);
            // expect(item).toEqual(result[idx]);
        });
    });
});
