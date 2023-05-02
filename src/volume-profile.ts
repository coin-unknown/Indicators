type Candle = { o: number; h: number; l: number; c: number; v: number; time: number };

const getPriceBySourceDefault = (candle: Candle) => {
    return (candle.o + candle.h + candle.l + candle.c) / 4;
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
    private lastPrice: number;
    private prevCandle: Candle | null = null;

    constructor(precision: number = 4, source = getPriceBySourceDefault) {
        this.source = source;
        this.precision = precision;
        this.valueToRoundWith = 10 ** this.precision;
    }

    /**
     * Get volume profile for current session
     */
    // Все еще не могу понять как считать важные уровни и группировать их
    getSession(candle: Candle, cleanOffset: number = 15) {
        const source = this.source(candle);
        let minDiff = Infinity;
        let middlePrice = source;

        this.sessionPricesLookup.forEach((price) => {
            const diff = this.diffPercent(price, source);

            if (diff > cleanOffset) {
                this.sessionPricesLookup.delete(price);
                delete this.sessionVolumes[price];
            } else if (diff < minDiff) {
                minDiff = diff;
                middlePrice = price;
            }
        });

        const prices = Array.from(this.sessionPricesLookup).sort();
        const middlePriceIndex = prices.indexOf(middlePrice);
        const session = new Map();

        if (middlePriceIndex === -1) {
            return session;
        }

        const segmentCount = 4;
        const segmentSize = Math.round(prices.length / segmentCount);
        let prevSegmentPrice = 0;

        for (let segment = 0; segment < segmentCount; segment++) {
            const start = segment * segmentSize;
            const end = start + segmentSize;

            let segmentVolume = 0;
            let segmentPrice = 0;

            for (let i = start; i < end; i++) {
                const currentPrice = prices[start];
                const currentVolume = this.sessionVolumes[currentPrice];

                if (segmentVolume < currentVolume) {
                    segmentVolume = currentVolume;
                    segmentPrice = currentPrice;
                }
            }

            if (this.diffPercent(prevSegmentPrice, segmentPrice) < 1) {
                segmentVolume = session.get(prevSegmentPrice) + segmentVolume;
                segmentPrice = this.roundPrice((segmentPrice + prevSegmentPrice) / 2);

                session.delete(prevSegmentPrice);
            }

            session.set(segmentPrice, segmentVolume);
            prevSegmentPrice = segmentPrice;
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
        // Source volume calculated like diff between two candles or new candle volume
        // Next value might me used for each ticks or only once per candle
        const volume = this.prevCandle?.time === candle.time ? candle.v - this.prevCandle.v : candle.v;

        this.addToSession(priceSource, volume);
        this.sum += volume;
        this.lastPrice = priceSource;
        this.prevCandle = candle;
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
        } else {
            this.sessionVolumes[price] += volume;
        }
    }

    /**
     * Percent change
     */
    private diffPercent(a: number, b: number): number {
        return a < b ? ((b - a) * 100) / a : ((a - b) * 100) / b;
    }
}
