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
    private lastPrice: number;

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
        this.sum = 0;
    }

    /**
     * Get volume profile for current session
     */
    public getSession(middlePrice: number, precision = 0.001, targetMultiplier = 2) {
        const prices = Array.from(this.sessionPricesLookup).sort();
        const session = new Map();
        const importantLevel = this.getSessionAvg() * targetMultiplier;
        const collectedPrices = [];
        let accVolume = 0;
        let accPrices = 0;
        let pricesCount = 0;
        let limitPrice = prices[0] + prices[0] * precision;
        let isPrevImportant = false;

        for (const price of prices) {
            const change = this.diffPercent(price, middlePrice);

            if (change > 8) {
                continue;
            }

            if (price > limitPrice) {
                const avgVolume = accVolume / pricesCount;
                const avgPrice = accPrices / pricesCount;
                const isCurrentImportant = avgVolume > importantLevel;

                if (isCurrentImportant && isPrevImportant) {
                    const prevPrice = collectedPrices.pop();
                    const prevVolume = session.get(prevPrice);
                    const commonAvgPrice = (avgPrice + prevPrice) / 2;
                    const commonAvgVolume = (avgVolume + prevVolume) / 2;

                    session.delete(prevPrice);
                    session.set(commonAvgPrice, commonAvgVolume);
                    collectedPrices.push(commonAvgPrice);
                } else if (isCurrentImportant) {

                    session.set(avgPrice, avgVolume);
                    limitPrice = price + price * precision;
                    collectedPrices.push(avgPrice)
                }

                isPrevImportant = isCurrentImportant;
                pricesCount = accVolume = accPrices = 0;
            }

            pricesCount++;
            accVolume += this.sessionVolumes[price];
            accPrices += price;
        }


        if (accVolume !== 0) {
            session.set(accPrices / pricesCount, accVolume / pricesCount);
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
        this.lastPrice = priceSource;
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

    /**
     * Percent change
     */
    private diffPercent(a: number, b: number): number {
        return  a < b ? ((b - a) * 100) / a : ((a - b) * 100) / b;
    }
}
