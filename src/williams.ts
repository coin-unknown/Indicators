/**
 * Developed by Larry Williams, Williams %R is a momentum indicator that is the inverse of the Fast Stochastic Oscillator.
 * Also referred to as %R, Williams %R reflects the level of the close relative to the highest high for the look-back period.
 * In contrast, the Stochastic Oscillator reflects the level of the close relative to the lowest low.
 * %R corrects for the inversion by multiplying the raw value by -100. As a result,
 * the Fast Stochastic Oscillator and Williams %R produce the exact same lines,
 * but with different scaling. Williams %R oscillates from 0 to -100; readings from 0 to -20 are considered overbought,
 * while readings from -80 to -100 are considered oversold. Unsurprisingly,
 * signals derived from the Stochastic Oscillator are also applicable to Williams %R.
 */
export class Williams {
    private higherH = 0;
    private lowerL = 0;
    private filled = false;

    constructor(private period: number) {}

    // formula
    // %R = (Highest High - Close)/(Highest High - Lowest Low) * -100

    public nextValue(h: number, l: number, c: number) {}
}
