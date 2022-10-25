type Candle = { o: number, h: number, l: number, c: number, v: number, time: number };


const getPriceBySourceDefault = (candle: Candle) => {
    return (candle.h + candle.l) / 2;
};

/**
 * Is an indicator that gives a data representation of how much volume occurs
 * at each individual price over a certain period of time (session)
 */
export class VolumeProfile {
    private precision: number;
    private valueToRoundWith: number;
    private source: (candle: Candle) => number;
    private sum = 0;
    private sessionPricesLookup = new Set<number>();
    private sessionVolumes: Record<number, number> = {};

    constructor(precision: number, source = getPriceBySourceDefault) {
        this.source = source;
        this.precision = precision;
        this.valueToRoundWith = 10 ** this.precision;
    }

    /**
     * Reset volume profile session
     */
    public resetSession() {
        this.sessionVolumes = {};
        this.sessionPricesLookup.clear();
    }

    /**
     * Get volume profile for current session, with ordered prices keys by ASC
     *
     * Use inject function for prepare custom data for indicator usage. For example
     * If you need to calculate average (SMA) volume or gets extremums, use that function for this
     * That's way saving all calculations in one for loop cycle.
     */
    public getSession() {
        const prices = Array.from(this.sessionPricesLookup).sort();
        const session = new Map();

        for (const price of prices) {
            const volume = this.sessionVolumes[price];

            session.set(price, volume);
        }

        return session;
    }

    /**
     * Get session avg volume
     */
    public getSessionAvg() {
        return this.sum / this.sessionPricesLookup.size;
    }

    /**
     * Get unformatted (raw) data for session
     */
    public getRawSession() {
        return this.sessionVolumes;
    }

    /**
     * Add value to session
     */
    nextValue(candle: Candle) {
        const priceSource = this.roundPrice(this.source(candle));

        this.addToSession(priceSource, candle.v);
        this.sum += candle.v;
    }

    /**
     * Round price value
     */
    private roundPrice(price: number): number {
        return Math.round((price + Number.EPSILON) * this.valueToRoundWith) / this.valueToRoundWith;
    }

    /**
     * Add volume to current session
     */
    private addToSession(price: number, volume: number) {
        const hasPrice = this.sessionPricesLookup.has(price);

        if (!hasPrice) {
            this.sessionPricesLookup.add(price);
            this.sessionVolumes[price] = volume;
        }

        this.sessionVolumes[price] += volume;
    }
}