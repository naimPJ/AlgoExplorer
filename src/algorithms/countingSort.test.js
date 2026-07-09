import { describe, it, expect } from 'vitest';
import { countingSort, countingSortInfo } from './countingSort';
import { testArrays, expectedSorted, expectInfoShape } from './testUtils';

const VALID_ACTIONS = new Set(['info', 'compare', 'write', 'fixed']);

describe('countingSort', () => {
    it.each(Object.entries(testArrays))('sorts %s correctly', (_, input) => {
        const { sortedArray } = countingSort(input);
        expect(sortedArray).toEqual(expectedSorted(input));
    });

    it('short-circuits on an empty array', () => {
        expect(countingSort(testArrays.empty)).toEqual({ steps: [], sortedArray: [] });
    });

    it('collapses duplicate values into shared bins', () => {
        const { steps } = countingSort(testArrays.duplicates);
        const infoStep = steps.find((s) => s.action === 'info');
        const uniqueSorted = [...new Set(testArrays.duplicates)].sort((a, b) => a - b);
        expect(infoStep.binKeys).toEqual(uniqueSorted);
    });

    it('emits only documented step actions with valid indices', () => {
        const { steps } = countingSort(testArrays.random);
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
        countingSort(input);
        expect(input).toEqual(testArrays.random);
    });

    it('exports a well-formed info object', () => {
        expectInfoShape(countingSortInfo);
    });
});
