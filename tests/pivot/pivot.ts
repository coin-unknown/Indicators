import { Pivot } from '../../src/pivot';
// High	1000
// Low	950
// Close	975

// R3	1050
// R2	1025
// R1	1000
// PP	975
// S1	950
// S2	925
// S3	900

const pivot = new Pivot();

console.log(pivot.nextValue(1000, 950, 975));
