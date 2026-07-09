import { describe, it, expect } from 'vitest';
import { mergeSort, mergeSortInfo } from './mergeSort';
import { testArrays, expectedSorted, expectInfoShape } from './testUtils';

const VALID_ACTIONS = new Set(['split', 'merge_start', 'compare', 'write', 'merge_complete']);

describe('mergeSort', () => {
    it.each(Object.entries(testArrays))('sorts %s correctly', (_, input) => {
        const { sortedArray } = mergeSort(input);
        expect(sortedArray).toEqual(expectedSorted(input));
    });

    it('produces no steps for empty and single-element arrays', () => {
        expect(mergeSort(testArrays.empty).steps).toEqual([]);
        expect(mergeSort(testArrays.single).steps).toEqual([]);
    });

    it('emits snapshot-shaped steps with a full array and valid indices', () => {
        const { steps } = mergeSort(testArrays.random);
        expect(steps.length).toBeGreaterThan(0);
        for (const step of steps) {
            expect(VALID_ACTIONS.has(step.action)).toBe(true);
            expect(step.array).toHaveLength(testArrays.random.length);
            for (const idx of step.indices) {
                expect(idx).toBeGreaterThanOrEqual(0);
                expect(idx).toBeLessThan(testArrays.random.length);
            }
        }
    });

    it('the final merge_complete step reflects the fully sorted array', () => {
        const { steps, sortedArray } = mergeSort(testArrays.random);
        const last = steps[steps.length - 1];
        expect(last.action).toBe('merge_complete');
        expect(last.array).toEqual(sortedArray);
    });

    it('does not mutate the input array', () => {
        const input = [...testArrays.random];
        mergeSort(input);
        expect(input).toEqual(testArrays.random);
    });

    it('exports a well-formed info object', () => {
        expectInfoShape(mergeSortInfo);
    });
});
