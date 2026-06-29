export const insertionSort = (array) => {
    const steps = [];
    const sortedArray = [...array];

    for (let i = 1; i < sortedArray.length; i++) {
        const iteration = i;
        const key = sortedArray[i];
        let j = i - 1;

        steps.push({
            indices: [i],
            action: "compare",
            description: `Taking element ${key} for insertion into sorted portion`,
            iteration,
            line: 1,
        });

        while (j >= 0 && sortedArray[j] > key) {
            steps.push({
                indices: [j, j + 1],
                action: "compare",
                description: `Comparing elements ${sortedArray[j]} and ${key}`,
                iteration,
                line: 4,
            });

            sortedArray[j + 1] = sortedArray[j];
            steps.push({
                indices: [j, j + 1],
                action: "swap",
                description: `Moving element ${sortedArray[j]} to the right`,
                iteration,
                line: 5,
            });

            j--;
        }

        if (j + 1 !== i) {
            sortedArray[j + 1] = key;
            steps.push({
                indices: [j + 1],
                action: "write",
                description: `Placing element ${key} at position ${j + 1}`,
                iteration,
                line: 7,
            });
        }

        steps.push({
            indices: Array.from({ length: i + 1 }, (_, idx) => idx),
            action: "fixed",
            description: `Array portion up to position ${i} is sorted`,
            iteration,
            line: 8,
        });
    }

    return { steps, sortedArray };
};

export const insertionSortInfo = {
    name: "Insertion Sort",
    timeComplexity: {
        best: "O(n)",
        average: "O(n²)",
        worst: "O(n²)"
    },
    spaceComplexity: "O(1)",
    description: "Insertion Sort is a sorting algorithm that builds the final sorted array one item at a time. It takes one element from the input data in each iteration and finds its correct position in the already sorted portion of the array.",
    pseudocode: [
        "for i = 1 to n−1:",
        "  key = arr[i]",
        "  j = i − 1",
        "  while j ≥ 0 and arr[j] > key:",
        "    compare arr[j] and key",
        "    shift arr[j] right",
        "    j = j − 1",
        "  place key at arr[j+1]",
        "  mark arr[0..i] as sorted",
    ],
};
