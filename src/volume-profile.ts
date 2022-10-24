import { Candle } from '@debut/types';

type VolumeProfileData = {
    [key: string]: VolumeItem;
};

type VolumeItem = {
    bearish: number;
    bullish: number;
    total: number;
    price: number;
};

const DEFAULT_VOLUME_ITEM: VolumeItem = {
    bearish: 0,
    bullish: 0,
    price: 0,
    total: 0,
};

export enum VolumeTypes {
    TOTAL = 'total',
    BULLISH = 'bullish',
    BEARISH = 'bearish',
}

export enum PriceSource {
    OPEN = 0,
    CLOSE = 1,
    LOW = 2,
    HIGH = 3,
    HL = 4,
    OHLC = 5,
}

const getPriceBySource = (source: PriceSource, candle: Candle) => {
    switch (source) {
        case PriceSource.OPEN:
            return candle.o;
        case PriceSource.CLOSE:
            return candle.c;
        case PriceSource.LOW:
            return candle.h;
        case PriceSource.HIGH:
            return candle.h;
        case PriceSource.HL:
            return (candle.h + candle.l) / 2;
        case PriceSource.OHLC:
            return (candle.o + candle.h + candle.l + candle.c) / 4;
    }
};

export class VolumeProfile {
    private precision: number;
    private result: VolumeProfileData;
    private valueToRoundWith: number;
    private source: PriceSource;

    constructor(precision: number, source = PriceSource.HL) {
        this.source = source;
        this.precision = precision;
        this.valueToRoundWith = 10 ** this.precision;
        this.result = {};
    }

    private roundValue(number: number): number {
        return Math.round((number + Number.EPSILON) * this.valueToRoundWith) / this.valueToRoundWith;
    }

    reset = () => {
        this.result = {};
    };

    getBestBy(type: VolumeTypes = VolumeTypes.TOTAL): null | VolumeItem {
        return Object.keys(this.result).reduce<VolumeItem>((acc, key) => {
            if (acc === null || this.result[key][type] > acc[type]) {
                acc = this.result[key];
            }

            return acc;
        }, null);
    }

    nextValue(candle: Candle): VolumeProfileData {
        const middlePrice = getPriceBySource(this.source, candle);
        const middleRoundedPrice = this.roundValue(middlePrice);

        const isBullishCandle = candle.c >= candle.o;

        if (!this.result[middleRoundedPrice]) {
            this.result[middleRoundedPrice] = DEFAULT_VOLUME_ITEM;
            this.result[middleRoundedPrice].price = middleRoundedPrice;
        }

        this.result[middleRoundedPrice].total += candle.v;

        if (isBullishCandle) {
            this.result[middleRoundedPrice].bullish += candle.v;
        } else {
            this.result[middleRoundedPrice].bearish += candle.v;
        }

        return this.result;
    }

    momentValue(candle: Candle): VolumeProfileData {
        const middlePrice = getPriceBySource(this.source, candle);
        const middleRoundedPrice = this.roundValue(middlePrice);

        const resultCopy = { ...this.result };

        const isBullishCandle = candle.c >= candle.o;

        if (!resultCopy[middleRoundedPrice]) {
            resultCopy[middleRoundedPrice] = DEFAULT_VOLUME_ITEM;
            resultCopy[middleRoundedPrice].price = middleRoundedPrice;
        }

        resultCopy[middleRoundedPrice].total += candle.v;

        if (isBullishCandle) {
            resultCopy[middleRoundedPrice].bullish += candle.v;
        } else {
            resultCopy[middleRoundedPrice].bearish += candle.v;
        }

        return resultCopy;
    }
}
