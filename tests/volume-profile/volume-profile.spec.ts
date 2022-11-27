import { VolumeProfile } from '../../src/volume-profile';
import data from './data';

describe('Volume Profile', () => {
    it('Base working test', () => {
        const actual: Record<string, string> = {};
        const expected = {
            '1.4589921875': '===',
            '1.464': '===',
            '1.471': '==',
            '1.477': '===',
            '1.487': '==',
            '1.49': '==='
        };

        function drawBar(count: number) {
            const length = Math.round(count / 100_000);

            return new Array(length).fill('=').join('');
        }

        const vp = new VolumeProfile(3);

        for (const candle of data) {
            vp.nextValue(candle);
        }

        const vpSession = vp.getSession(data[data.length - 1].c);


        vpSession.forEach((volume, price) => {
            actual[price] =  drawBar(volume);
        });

        expect(actual).toEqual(expected);
    });
});
