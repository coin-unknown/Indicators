import { CircularBuffer } from './circular-buffer';

/**
 * Circular buffers extension for fast detection highs and lows in period
 */
export class CircularBufferHL extends CircularBuffer<number> {
    public high = -Infinity;
    private prevHigh = -Infinity;
    private highCounts = 0;

    /**
     * Push item to buffer, when buffer length is overflow, push will rewrite oldest item
     */
    public push(item: number): number {
        const removed = super.push(item);

        if (removed === this.high) {
            this.highCounts--;

            if (this.highCounts === 0) {
                this.high = this.prevHigh;
            }
        }

        if (item > this.high) {
            this.prevHigh = this.high;
            this.high = item;
            this.highCounts = 0;
        } else if (item === this.high) {
            this.highCounts++;
        } else if (item > this.prevHigh) {
            this.prevHigh = item;
        }

        return removed;
    }
}
