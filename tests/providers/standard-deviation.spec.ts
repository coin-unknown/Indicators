import { StandardDeviation } from '../../src/providers/standard-deviation';
import { SMA } from '../../src/sma';
import { SD } from 'technicalindicators';

export const closes = [
    1975, 1984.65, 1983.3, 1986.55, 1987.8, 1986.75, 1989, 1990.1, 1992.7, 1997.35, 1995.6, 1987, 1986.1, 1982, 1979.95,
    1983.95, 1985, 1983.15, 1983.5, 1983.95, 1980.95, 1984.1, 1984.9, 1985.85, 1985.95, 1985.95, 1985.25, 1984.35,
    1985.2, 1983.95, 1984.5, 1984.75, 1985.25, 1984.6, 1985.5, 1985.2, 1986.4, 1987.9, 1987, 1987.85, 1987.9, 1988.35,
    1988.25, 1988.4, 1988.35, 1987.95, 1987.7, 1988.25, 1990.35, 1990.9, 1991.45, 1991.45, 1987.75, 1990.35, 1990,
    1987.3, 1989.7, 1989.25, 1989, 1988.95, 1987, 1987.7, 1984, 1981.2, 1984.2, 1986.9, 1984.5, 1984.85, 1983.05, 1985,
    1983.5, 1983.85, 1983.45, 1981.05, 1978.05, 1986.95, 1993.45, 1991.05, 1990.2, 1988.95, 1987.35, 1989.65, 1989.85,
    1985.05, 1986.65, 1984.8, 1988.5, 1987.2, 1986, 1985.9, 1985.95, 1988.6, 1987.65,
];

describe('StandardDeviation', () => {
    const PERIOD = 6;

    it('Basic usage', () => {
        const stDevOne = new StandardDeviation(PERIOD);
        const stDevThird = new SD({ period: PERIOD, values: [] });
        const sma = new SMA(PERIOD);

        closes.forEach((item) => {
            const mean = sma.nextValue(item);

            const localValue = stDevOne.nextValue(item, mean);
            const externalValue = stDevThird.nextValue(item);

            if (localValue && externalValue) {
                expect(Math.abs(localValue - externalValue)).toBeLessThan(0.00001);
            }
        });
    });
});
