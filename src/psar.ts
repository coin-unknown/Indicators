/**
 In stock and securities market technical analysis, parabolic SAR (parabolic stop and reverse)
 is a method devised by J. Welles Wilder, Jr., to find potential reversals in the market price
 direction of traded goods such as securities or currency exchanges such as forex It is a
 trend-following (lagging) indicator and may be used to set a trailing stop loss or determine
 entry or exit points based on prices tending to stay within a parabolic curve during a strong trend.

 Similar to option theory's concept of time decay, the concept draws on the idea that "time is the enemy".
 Thus, unless a security can continue to generate more profits over time, it should be liquidated.
 The indicator generally works only in trending markets, and creates "whipsaws" during ranging or,
 sideways phases. Therefore, Wilder recommends first establishing the direction or change in direction
 of the trend through the use of parabolic SAR, and then using a different indicator such as the
 Average Directional Index to determine the strength of the trend.

 A parabola below the price is generally bullish, while a parabola above is generally bearish.
 A parabola below the price may be used as support, whereas a parabola above the price may represent resistance.
 * */

export class PSAR {
    private start: number;
    private acceleration: number;
    private max: number;
    private psar: number;
    private isBullTrend: boolean;
    private result: number;
    private low1: number;
    private high1: number;
    private low2: number;
    private high2: number;
    private accelerationForce: number;
    private lowest: number;
    private highest: number;

    constructor(start = 0.02, acceleration = 0.02, max = 0.2) {
        this.start = start;
        this.acceleration = acceleration;
        this.max = max;
        this.result = 0;
        this.isBullTrend = true;
    }

    nextValue({ h: high, l: low, c: close }: { h: number; l: number; c: number }) {
        let isReverse = false;

        if (!this.result) {
            this.result = close;
            this.low1 = low;
            this.high1 = high;
            this.low2 = low;
            this.high2 = high;
            this.highest = high;
            this.lowest = low;
            this.accelerationForce = this.start;

            return low;
        }

        if (this.isBullTrend) {
            this.psar = this.result + this.accelerationForce * (this.highest - this.result);
        } else {
            this.psar = this.result + this.accelerationForce * (this.lowest - this.result);
        }

        if (this.isBullTrend) {
            if (low < this.psar) {
                this.isBullTrend = false;
                isReverse = true;
                this.psar = this.highest;
                this.lowest = low;
                this.accelerationForce = this.start;
            }
        } else {
            if (high > this.psar) {
                this.isBullTrend = true;
                isReverse = true;
                this.psar = this.lowest;
                this.highest = high;
                this.accelerationForce = this.start;
            }
        }

        if (!isReverse) {
            if (this.isBullTrend) {
                if (high > this.highest) {
                    this.highest = high;
                    this.accelerationForce = Math.min(this.accelerationForce + this.acceleration, this.max);
                }
                if (this.low1 < this.psar) {
                    this.psar = this.low1;
                }
                if (this.low2 < this.psar) {
                    this.psar = this.low2;
                }
            } else {
                if (low < this.lowest) {
                    this.lowest = low;
                    this.accelerationForce = Math.min(this.accelerationForce + this.acceleration, this.max);
                }
                if (this.high1 > this.psar) {
                    this.psar = this.high1;
                }
                if (this.high2 > this.psar) {
                    this.psar = this.high2;
                }
            }
        }

        this.low2 = this.low1;
        this.low1 = low;
        this.high2 = this.high1;
        this.high1 = high;
        this.result = this.psar;

        return this.result;
    }

    momentValue({ h: high, l: low }: { h: number; l: number }) {
        if (!this.result) {
            return;
        }

        let isReverse = false;
        let isBullTrend = this.isBullTrend;
        let result = this.result;
        let low1 = this.low1;
        let high1 = this.high1;
        let low2 = this.low2;
        let high2 = this.high2;
        let highest = this.highest;
        let lowest = this.lowest;
        let accelerationForce = this.accelerationForce;

        let psar;

        if (isBullTrend) {
            psar = result + accelerationForce * (highest - result);
        } else {
            psar = result + accelerationForce * (lowest - result);
        }

        if (isBullTrend) {
            if (low < psar) {
                isBullTrend = false;
                isReverse = true;
                psar = highest;
            }
        } else {
            if (high > psar) {
                isBullTrend = true;
                isReverse = true;
                psar = lowest;
            }
        }

        if (!isReverse) {
            if (isBullTrend) {
                if (low1 < psar) {
                    psar = low1;
                }
                if (low2 < psar) {
                    psar = low2;
                }
            } else {
                if (high1 > psar) {
                    psar = high1;
                }
                if (high2 > psar) {
                    psar = high2;
                }
            }
        }

        return psar;
    }
}
