/**
 * Pivot points are major support and resistance levels where there likely to be a retracement
 * of price used by traders to objectively determine potential entry and exit levels of underlying assets.
 * Pivot point breaks can be an entry marker, confirmation of trend direction
 * also confirmation of trend reversal -exit marker.
 * These retracement calculation is based on the last day trading data as we follow
 * the market open, high, low, close on every day.
 * You can also calculate these pivot level on weekly basis.
 * For weekly pivot you need to weekly high, low, and close prices.
 */
export class Pivot {
    // Pivot Point (P) = (High + Low + Close)/3
    // Support 1 (S1) = (P x 2) - High
    // Support 2 (S2) = P  -  (High  -  Low)
    // Support 3 (S3) = Low – 2(High – PP)
    // Resistance 1 (R1) = (P x 2) - Low
    // Resistance 2 (R2) = P + (High  -  Low)
    // Resistance 3 (R3) = High + 2(PP – Low)

    /**
     * Get next value for closed candle hlc
     * affect all next calculations
     */
    nextValue(h: number, l: number, c: number) {
        const pivotPoint = (h + l + c) / 3;
        const support1 = pivotPoint * 2 - h;
        const support2 = pivotPoint - (h - l);
        const support3 = l - 2 * (h - pivotPoint);
        const resistance1 = pivotPoint * 2 - l;
        const resistance2 = pivotPoint + (h - l);
        const resistance3 = h + 2 * (pivotPoint - l);

        return {
            r3: resistance3,
            r2: resistance2,
            r1: resistance1,
            pp: pivotPoint,
            s1: support1,
            s2: support2,
            s3: support3,
        };
    }
}
