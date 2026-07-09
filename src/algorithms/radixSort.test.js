import { describe, it, expect } from 'vitest';
import { radixSort, radixSortInfo } from './radixSort';
import { testArrays, expectedSorted, expectInfoShape } from './testUtils';

const VALID_ACTIONS = new Set(['info', 'compare', 'write', 'fixed']);

describe('radixSort', () => {
    it.each(Object.entries(testArrays))('sorts %s correctly', (_, input) => {
        const { sortedArray } = radixSort(input);
        expect(sortedArray).toEqual(expectedSorted(input));
    });

    it('produces no steps for an empty array', () => {
        expect(radixSort(testArrays.empty).steps).toEqual([]);
    });

    it('emits only documented step actions with valid indices', () => {
        const { steps } = radixSort(testArrays.random);
        expect(steps.length).toBeGreaterThan(0);
        for (const step of steps) {
            expect(VALID_ACTIONS.has(step.action)).toBe(true);
            for (const idx of step.indices) {
                expect(idx).toBeGreaterThanOrEqual(0);
                expect(idx).toBeLessThan(testArrays.random.length);
            }
        }
    });

    it('does not mutate the input array', () => {
        const input = [...testArrays.random];
        radixSort(input);
        expect(input).toEqual(testArrays.random);
    });

    it('exports a well-formed info object', () => {
        expectInfoShape(radixSortInfo);
    });
});
