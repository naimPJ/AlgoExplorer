export const countingSort = (array) => {
    if (array.length === 0) return { steps: [], sortedArray: [] };

    const steps = [];
    const original = [...array];
    const sortedArray = [...array];

    // Only track buckets for values that actually appear
    const uniqueVals = [...new Set(original)].sort((a, b) => a - b);
    const bucketIndex = new Map(uniqueVals.map((v, i) => [v, i]));
    const bins = new Array(uniqueVals.length).fill(0);

    const snap = () => [...bins];

    // Phase 1 — count occurrences
    steps.push({
        indices: [],
        action: "info",
        description: `${uniqueVals.length} unique values: ${uniqueVals.join(', ')}`,
        iteration: 1,
        array: original,
        bins: snap(),
        binKeys: uniqueVals,
        activeBin: null,
        output: null,
        outputActive: null,
        line: 1,
    });

    for (let i = 0; i < original.length; i++) {
        const num = original[i];
        const bi  = bucketIndex.get(num);
        bins[bi]++;
        steps.push({
            indices: [i],
            action: "compare",
            description: `Element ${num} → bucket ${num}: count is now ${bins[bi]}`,
            iteration: 1,
            array: original,
            bins: snap(),
            binKeys: uniqueVals,
            activeBin: bi,
            output: null,
            outputActive: null,
            line: 3,
        });
    }

    // Phase 2 — drain buckets in order into output
    const output = new Array(original.length).fill(null);
    let pos = 0;

    for (let bi = 0; bi < uniqueVals.length; bi++) {
        const val = uniqueVals[bi];
        while (bins[bi] > 0) {
            output[pos] = val;
            bins[bi]--;
            steps.push({
                indices: [],
                action: "write",
                description: `Place ${val} → output[${pos}]`,
                iteration: 2,
                array: original,
                bins: snap(),
                binKeys: uniqueVals,
                activeBin: bi,
                output: [...output],
                outputActive: pos,
                line: 7,
            });
            pos++;
        }
    }

    // Copy back
    for (let i = 0; i < sortedArray.length; i++) {
        sortedArray[i] = output[i];
    }

    steps.push({
        indices: [],
        action: "fixed",
        description: "Array sorted",
        iteration: 2,
        array: [...sortedArray],
        bins: snap(),
        binKeys: uniqueVals,
        activeBin: null,
        output: [...output],
        outputActive: null,
        line: 9,
    });

    return { steps, sortedArray };
};

export const countingSortInfo = {
    name: "Counting Sort",
    timeComplexity: {
        best: "O(n + k)",
        average: "O(n + k)",
        worst: "O(n + k)"
    },
    spaceComplexity: "O(k)",
    description: "Counting Sort is a non-comparative sorting algorithm that works by counting the number of objects having distinct key values, and using arithmetic to determine the positions of each key value in the output sequence.",
    pseudocode: [
        "count = {} (empty map)",
        "Phase 1 — count occurrences:",
        "  for each element in arr:",
        "    count[element]++",
        "Phase 2 — drain buckets in order:",
        "  for each value in sorted(count.keys):",
        "    while count[value] > 0:",
        "      write value to output",
        "      count[value]--",
        "array is sorted",
    ],
};
