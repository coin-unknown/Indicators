export function sum(arr: number[]) {
    let sum = 0;
    let i = arr.length;

    while (i > 0) {
        sum += arr[--i];
    }

    return sum;
}

export const percentChange = (current: number, prev: number) => ((current - prev) / prev) * 100;
export const avg = (arr: number[], period = arr.length) => sum(arr) / period || 0;
export const getMax = (arr: number[]) => {
    let max = -Infinity;
    let idx = 0;

    for (let i = arr.length - 1; i >= 0; i--) {
        const item = arr[i];

        if (max < item) {
            idx = i;
            max = item;
        }
    }

    return max;
};
export const getMin = (arr: number[]) => {
    let min = Infinity;
    let idx = 0;

    for (let i = arr.length - 1; i >= 0; i--) {
        const item = arr[i];

        if (min > item) {
            idx = i;
            min = item;
        }
    }

    return min;
};
