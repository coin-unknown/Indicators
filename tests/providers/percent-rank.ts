import { PercentRank } from '../../src/providers/percent-rank';

const percentRank = new PercentRank(10);

[100, 5, 20, 50, 55, 60, 70, 80, 90, 1].forEach((v) => {
    percentRank.nextValue(v);
});

console.log(percentRank.nextValue(66));
