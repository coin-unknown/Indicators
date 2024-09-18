import { MFI } from '../../src/mfi';
import { MFI as MFICross } from 'technicalindicators'; 
import { data, excelData } from './data';

describe('MFI', () => {
    it('Cross Validate', () => {
        const mfi = new MFI(14);
        const mfiCross = new MFICross({ period: 14, high: [], low: [], close: [], volume: [] });

        data.forEach(({ high, low, close, volume }) => {
            const calculated = mfi.nextValue(high, low, close, volume);
            const sdk = mfiCross.nextValue({ high, low, close, volume });

            if (sdk && calculated) {
                expect(Math.abs(calculated - sdk)).toBeLessThan(0.005);
            }
        });
    });

    it('Excel validate', () => {
        const mfi = new MFI(14);

        excelData.forEach(({ high, low, close, volume, Mfi }) => {
            const calculated = mfi.nextValue(high, low, close, volume);

            if (Mfi && calculated) {
                expect(Math.abs(calculated - Mfi)).toBeLessThan(0.00001);
            }
        });
    });
});
