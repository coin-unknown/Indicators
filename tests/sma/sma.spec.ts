import { SMA } from '../../src/sma';
import { SMA as SMA2 } from 'technicalindicators';
import { BigFloat32 } from 'bigfloat';

describe('Simple Moving Average', () => {
    const ticks = [120, 150, 240, 540, 210, 380, 120, 870, 250, 1100, 500, 950];
    // Interval = 2
    const interval2 = [undefined, 135, 195, 390, 375, 295, 250, 495, 560, 675, 800, 725];
    // Interval = 4
    const interval4 = [undefined, undefined, undefined, 262.5, 285, 342.5, 312.5, 395, 405, 585, 680, 700];
    // Interval = 6
    const interval6 = [
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        273.333333333333,
        273.333333333333,
        393.333333333333,
        395,
        488.333333333333,
        536.666666666667,
        631.666666666667,
    ];

    const sma2 = new SMA(2);
    const sma4 = new SMA(4);
    const sma6 = new SMA(6);
    const EPSILON = 0.0001;

    it('Excel validate', () => {
        ticks.forEach((tick, idx) => {
            const sma2Calc = sma2.nextValue(tick);
            const sma4Calc = sma4.nextValue(tick);
            const sma6Calc = sma6.nextValue(tick);

            if (interval2[idx]) {
                expect(Math.abs(sma2Calc - interval2[idx])).toBeLessThan(EPSILON);
            }

            if (interval4[idx]) {
                expect(Math.abs(sma4Calc - interval4[idx])).toBeLessThan(EPSILON);
            }

            if (interval6[idx]) {
                expect(Math.abs(sma6Calc - interval6[idx])).toBeLessThan(EPSILON);
            }
        });
    });

    it('Cross validate', () => {
        const localSMA = new SMA(6);
        const crossSMA = new SMA2({ period: 6, values: [] });

        ticks.forEach((tick) => {
            const calc = localSMA.nextValue(tick);
            const cross = crossSMA.nextValue(tick);

            expect(calc).toEqual(cross);
        });
    });

    it('Machine precision error', () => {
        const array = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30];
        const localSMA = new SMA(20);
        const idealSMAValue = 20.5;

        let lastValue = 0;

        for (let i = 0; i < array.length; i++) {
            lastValue = localSMA.nextValue(array[i])!;
        }

        console.log(lastValue, idealSMAValue);
    });

    it.only('BigInt vs Float floating error', () => {

        function bigFloatSMA(array: number[], period = 20) {
            let sum = new BigFloat32(0);

            for (let i = array.length - period; i < array.length; i++) {
               sum = sum.add(array[i]);
            }

            return sum.mul(1/period);
        }

        const arraySize = 900_000;
        const randomDataArray = Array.from({length: arraySize}, () => Math.floor(Math.random() * arraySize));
        const localSMA = new SMA(20);

        for (let i = 0; i < randomDataArray.length; i++) {
            const calculatedIntSMA = localSMA.nextValue(randomDataArray[i]);

            if (!calculatedIntSMA || i < 20) {
                continue;
            }

            const calculatedBigIntSMA = bigFloatSMA(randomDataArray.slice(i-20, i + 1));
            // console.log(calculatedIntSMA, Number(calculatedBigIntSMA));

            expect(calculatedIntSMA).toEqual(Number(calculatedBigIntSMA));
        }
    });
});


