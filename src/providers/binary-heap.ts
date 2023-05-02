import { CircularBuffer } from './circular-buffer';

type Comparator = (a: number, b: number) => number;

/**
 * Gets parent index for given index.
 * @param  {Number} idx  Children index
 * @return {Number | undefined}      Parent index, -1 if idx is 0
 */
const getParentIndexOf = (idx: number): number => {
    if (idx <= 0) {
        return -1;
    }
    const whichChildren = idx % 2 ? 1 : 2;
    return Math.floor((idx - whichChildren) / 2);
};

/**
 * Gets children indices for given index.
 * @param  {Number} idx     Parent index
 * @return {Array(Number)}  Array of children indices
 */
const getChildrenIndexOf = (idx: number): number[] => {
    return [idx * 2 + 1, idx * 2 + 2];
};

/**
 * Heap
 */
export class Heap {
    private heapArray: number[] = [];
    private heapBuffer: CircularBuffer;

    /**
     * Heap instance constructor.
     * @param  {Function} compare Optional comparison function, defaults to Heap.minComparator<number>
     */
    constructor(public compare: Comparator = Heap.minComparator, private limit = 0) {
        this.heapBuffer = new CircularBuffer(this.limit);
    }

    /**
     * Min number heap comparison function, default.
     * @param  {Number} a     First element
     * @param  {Number} b     Second element
     * @return {Number}    0 if they're equal, positive if `a` goes up, negative if `b` goes up
     */
    static minComparator(a: number, b: number): number {
        return a - b;
    }

    /**
     * Max number heap comparison function.
     * @param  {Number} a     First element
     * @param  {Number} b     Second element
     * @return {Number}    0 if they're equal, positive if `a` goes up, negative if `b` goes up
     */
    static maxComparator(a: number, b: number): number {
        return b - a;
    }

    /**
     * Remove all of the elements from this heap.
     */
    public clear(): void {
        this.heapArray.length = 0;
    }

    /**
     * Top node. Aliases: `element`.
     * Same as: `top(1)[0]`
     */
    public peek(): number | undefined {
        return this.heapArray[0];
    }

    /**
     * Pushes element(s) to the heap.
     */
    public push(element: number): boolean {
        this._sortNodeUp(this.heapArray.push(element) - 1);
        const removed = this.heapBuffer.push(element);

        if (removed) {
            this.remove(removed);
        }

        return true;
    }

    /**
     * Extract the top node (root). Aliases: `poll`.
     * @return {any} Extracted top node, undefined if empty
     */
    pop(): number | undefined {
        const last = this.heapArray.pop();
        if (this.heapArray.length > 0 && last !== undefined) {
            return this.replace(last);
        }
        return last;
    }

    /**
     * Remove an element from the heap.
     */
    public remove(element: number): boolean {
        const size = this.heapArray.length;

        if (size === 0) {
            return false;
        }

        const idx = this.heapArray.indexOf(element);

        if (idx === -1) {
            return false;
        }

        if (idx === 0) {
            this.pop();
        } else if (idx === -1) {
            this.heapArray.pop();
        } else {
            this.heapArray.splice(idx, 1, this.heapArray.pop());
            this._sortNodeUp(idx);
            this._sortNodeDown(idx);
        }

        return true;
    }

    /**
     * Pop the current peek value, and add the new item.
     */
    private replace(element: number): number {
        const peek = this.heapArray[0];
        this.heapArray[0] = element;
        this._sortNodeDown(0);
        return peek;
    }

    /**
     * Move a node to a new index, switching places
     * @param  {Number} j First node index
     * @param  {Number} k Another node index
     */
    _moveNode(j: number, k: number): void {
        [this.heapArray[j], this.heapArray[k]] = [this.heapArray[k], this.heapArray[j]];
    }

    /**
     * Move a node down the tree (to the leaves) to find a place where the heap is sorted.
     * @param  {Number} i Index of the node
     */
    _sortNodeDown(i: number): void {
        let moveIt = i < this.heapArray.length - 1;
        const self = this.heapArray[i];

        const getPotentialParent = (best: number, j: number) => {
            if (this.heapArray.length > j && this.compare(this.heapArray[j], this.heapArray[best]) < 0) {
                best = j;
            }
            return best;
        };

        while (moveIt) {
            const childrenIdx = getChildrenIndexOf(i);
            const bestChildIndex = childrenIdx.reduce(getPotentialParent, childrenIdx[0]);
            const bestChild = this.heapArray[bestChildIndex];
            if (typeof bestChild !== 'undefined' && this.compare(self, bestChild) > 0) {
                this._moveNode(i, bestChildIndex);
                i = bestChildIndex;
            } else {
                moveIt = false;
            }
        }
    }

    /**
     * Move a node up the tree (to the root) to find a place where the heap is sorted.
     * @param  {Number} i Index of the node
     */
    _sortNodeUp(i: number): void {
        let moveIt = i > 0;
        while (moveIt) {
            const pi = getParentIndexOf(i);
            if (pi >= 0 && this.compare(this.heapArray[pi], this.heapArray[i]) > 0) {
                this._moveNode(i, pi);
                i = pi;
            } else {
                moveIt = false;
            }
        }
    }

    /**
     * Get the elements of these node's children
     * @param  {Number} idx Node index
     * @return {Array(any)}  Children elements
     */
    private getChildrenOf(idx: number): number[] {
        return getChildrenIndexOf(idx)
            .map((i) => this.heapArray[i])
            .filter((e) => e !== undefined);
    }
}
