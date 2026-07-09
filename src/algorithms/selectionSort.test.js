import { describe, it, expect } from 'vitest';
import { selectionSort, selectionSortInfo } from './selectionSort';
import { testArrays, expectedSorted, expectInfoShape } from './testUtils';

const VALID_ACTIONS = new Set(['compare', 'swap', 'fixed']);

describe('selectionSort', () => {
    it.each(Object.entries(testArrays))('sorts %s correctly', (_, input) => {
        const { sortedArray } = selectionSort(input);
        expect(sortedArray).toEqual(expectedSorted(input));
    });

    it('produces no steps for empty and single-element arrays', () => {
        expect(selectionSort(testArrays.empty).steps).toEqual([]);
        expect(selectionSort(testArrays.single).steps).toEqual([]);
    });

    it('emits only documented step actions with valid indices', () => {
        const { steps } = selectionSort(testArrays.random);
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
        selectionSort(input);
        expect(input).toEqual(testArrays.random);
    });

    it('exports a well-formed info object', () => {
        expectInfoShape(selectionSortInfo);
    });
});
