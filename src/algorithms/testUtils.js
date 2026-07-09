export const testArrays = {
    random: [5, 3, 8, 1, 9, 2, 7],
    sorted: [1, 2, 3, 4, 5],
    reverseSorted: [5, 4, 3, 2, 1],
    duplicates: [4, 2, 4, 1, 2, 4],
    single: [7],
    empty: [],
};

export const expectedSorted = (arr) => [...arr].sort((a, b) => a - b);

export const expectInfoShape = (info) => {
    expect(typeof info.name).toBe('string');
    expect(info.name.length).toBeGreaterThan(0);
    expect(typeof info.timeComplexity).toBe('object');
    expect(typeof info.spaceComplexity).toBe('string');
    expect(typeof info.description).toBe('string');
    expect(info.description.length).toBeGreaterThan(0);
};
