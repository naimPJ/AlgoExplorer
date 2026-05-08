export const countingSort = (array) => {
    if (array.length === 0) return { steps: [], sortedArray: [] };

    const steps = [];
    const original = [...array];
    const sortedArray = [...array];
    const min = Math.min(...array);
    const max = Math.max(...array);
    const range = max - min + 1;
    const count = new Array(range).fill(0);
    const output = new Array(sortedArray.length).fill(null);

    // Phase 1 — count occurrences
    steps.push({
        indices: [],
        action: "info",
        description: `Range: ${min} to ${max} (${range} buckets)`,
        iteration: 1,
        array: original,
        bins: [...count],
        binMin: min,
        activeBin: null,
        output: [...output],
        outputActive: null,
    });

    for (let i = 0; i < original.length; i++) {
        const num = original[i];
        count[num - min]++;
        steps.push({
            indices: [i],
            action: "compare",
            description: `Element ${num} → bucket ${num}: count is now ${count[num - min]}`,
            iteration: 1,
            array: original,
            bins: [...count],
            binMin: min,
            activeBin: num - min,
            output: [...output],
            outputActive: null,
        });
    }

    // Phase 2 — prefix sums
    for (let i = 1; i < count.length; i++) {
        count[i] += count[i - 1];
        steps.push({
            indices: [],
            action: "info",
            description: `Prefix sum for ${i + min}: ${count[i - 1] - (count[i] - count[i - 1])} + ${count[i] - count[i - 1]} = ${count[i]}`,
            iteration: 2,
            array: original,
            bins: [...count],
            binMin: min,
            activeBin: i,
            output: [...output],
            outputActive: null,
        });
    }

    // Phase 3 — place elements (right to left for stability)
    for (let i = original.length - 1; i >= 0; i--) {
        const num = original[i];
        const pos = count[num - min] - 1;
        output[pos] = num;
        count[num - min]--;
        steps.push({
            indices: [i],
            action: "write",
            description: `Place ${num} (pos ${i}) → output[${pos}]`,
            iteration: 3,
            array: original,
            bins: [...count],
            binMin: min,
            activeBin: num - min,
            output: [...output],
            outputActive: pos,
        });
    }

    // Final — copy back
    for (let i = 0; i < sortedArray.length; i++) {
        sortedArray[i] = output[i];
    }

    steps.push({
        indices: [],
        action: "fixed",
        description: "Array sorted",
        iteration: 3,
        array: [...sortedArray],
        bins: [...count],
        binMin: min,
        activeBin: null,
        output: [...output],
        outputActive: null,
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
    description: "Counting Sort is a non-comparative sorting algorithm that works by counting the number of objects having distinct key values, and using arithmetic to determine the positions of each key value in the output sequence."
};
