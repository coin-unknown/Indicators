import { PSAR } from '../../src/psar';
import { PSAR as PSAR2 } from 'technicalindicators';
import { lows, highs, closes } from './excel-data';

describe('PSAR', () => {
    it('Cross sdk validate', () => {
        const psar = new PSAR();

        const local = [];
        const cross = PSAR2.calculate({high: highs, low: lows, step: 0.02, max: 0.2})

        for(let i = 0; i < lows.length; i++) {
            local.push(psar.nextValue({h: highs[i], c: closes[i], l: lows[i]}))
        }

        expect(local).toEqual(cross);
    });
});
