/**
 * True range calculation
 */
export function getTrueRange(high: number, low: number, prevClose: number) {
    if (prevClose) {
        // Linear conditions without max min and abs
        // Perormance reason
        const hl = high - low;
        const hc = high > prevClose ? high - prevClose : prevClose - high;
        const lc = low > prevClose ? low - prevClose : prevClose - low;

        if (hl >= hc && hl >= lc) {
            return hl;
        }

        if (hc >= hl && hc >= lc) {
            return hc;
        }

        return lc;
    }

    return;
}
