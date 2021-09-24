export class CircularBuffer<T = number> {
    protected pointer = 0;
    protected buffer: Array<T>;
    protected filledCache = false;

    constructor(public length: number) {
        this.buffer = new Array(length);
    }

    public push(item: T) {
        const overwrited = this.buffer[this.pointer];
        this.buffer[this.pointer] = item;
        this.pointer = (this.length + this.pointer + 1) % this.length;

        return overwrited;
    }

    public pushback(item: T) {
        this.pointer = (this.length + this.pointer - 1) % this.length;
        const overwrited = this.buffer[this.pointer];
        this.buffer[this.pointer] = item;

        return overwrited;
    }

    public current() {
        return this.buffer[this.pointer];
    }

    public toArray() {
        return this.buffer;
    }

    public filled() {
        this.filledCache = this.filledCache || this.pointer === this.length - 1;

        return this.filledCache;
    }
}
