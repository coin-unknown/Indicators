export class CircularBuffer<T = number> {
    private pointer = 0;
    private buffer: Array<T>;

    constructor(public length: number) {
        this.buffer = new Array(length).fill(0);
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
}
