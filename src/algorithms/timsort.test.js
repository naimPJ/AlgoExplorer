import { describe, it, expect } from 'vitest';
import { timsort, timsortInfo } from './timsort';
import { testArrays, expectedSorted, expectInfoShape } from './testUtils';

const VALID_ACTIONS = new Set(['compare', 'swap', 'write', 'fixed']);

describe('timsort', () => {
    it.each(Object.entries(testArrays))('sorts %s correctly', (_, input) => {
        const { sortedArray } = timsort(input);
        expect(sortedArray).toEqual(expectedSorted(input));
    });

    it('produces no steps for an empty array', () => {
        expect(timsort(testArrays.empty).steps).toEqual([]);
    });

    it('sorts a larger array spanning multiple runs (MIN_RUN = 8)', () => {
        const input = Array.from({ length: 40 }, (_, i) => (40 - i) % 37);
        const { sortedArray } = timsort(input);
        expect(sortedArray).toEqual(expectedSorted(input));
    });

    it('emits only documented step actions with valid indices', () => {
        const { steps } = timsort(testArrays.random);
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
        timsort(input);
        expect(input).toEqual(testArrays.random);
    });

    it('exports a well-formed info object', () => {
        expectInfoShape(timsortInfo);
    });
});
