import { describe, it, expect } from 'vitest';
import { bubbleSort, bubbleSortInfo } from './bubbleSort';
import { testArrays, expectedSorted, expectInfoShape } from './testUtils';

const VALID_ACTIONS = new Set(['compare', 'swap', 'fixed']);

describe('bubbleSort', () => {
    it.each(Object.entries(testArrays))('sorts %s correctly', (_, input) => {
        const { sortedArray } = bubbleSort(input);
        expect(sortedArray).toEqual(expectedSorted(input));
    });

    it('produces no steps for an empty array', () => {
        expect(bubbleSort(testArrays.empty).steps).toEqual([]);
    });

    it('still marks the single element as fixed for a one-element array', () => {
        const { steps } = bubbleSort(testArrays.single);
        expect(steps).toHaveLength(1);
        expect(steps[0].action).toBe('fixed');
    });

    it('emits only documented step actions with valid indices', () => {
        const { steps } = bubbleSort(testArrays.random);
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
        bubbleSort(input);
        expect(input).toEqual(testArrays.random);
    });

    it('exports a well-formed info object', () => {
        expectInfoShape(bubbleSortInfo);
    });
});
