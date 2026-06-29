export const selectionSort = (array) => {
    const steps = [];
    const sortedArray = [...array];

    for (let i = 0; i < sortedArray.length - 1; i++) {
        const iteration = i + 1;
        let minIndex = i;

        steps.push({
            indices: [i],
            action: "compare",
            description: `Looking for the smallest element starting from position ${i}`,
            iteration,
            line: 1,
        });

        for (let j = i + 1; j < sortedArray.length; j++) {
            steps.push({
                indices: [minIndex, j],
                action: "compare",
                description: `Comparing elements ${sortedArray[minIndex]} and ${sortedArray[j]}`,
                iteration,
                line: 3,
            });

            if (sortedArray[j] < sortedArray[minIndex]) {
                minIndex = j;
            }
        }

        if (minIndex !== i) {
            steps.push({
                indices: [i, minIndex],
                action: "swap",
                description: `Swapping elements ${sortedArray[i]} and ${sortedArray[minIndex]}`,
                iteration,
                line: 5,
            });
            [sortedArray[i], sortedArray[minIndex]] = [sortedArray[minIndex], sortedArray[i]];
        }

        steps.push({
            indices: [i],
            action: "fixed",
            description: `Element ${sortedArray[i]} is in its final position`,
            iteration,
            line: 6,
        });
    }

    return { steps, sortedArray };
};

export const selectionSortInfo = {
    name: "Selection Sort",
    timeComplexity: {
        best: "O(n²)",
        average: "O(n²)",
        worst: "O(n²)"
    },
    spaceComplexity: "O(1)",
    description: "Selection Sort is a simple sorting algorithm that repeatedly finds the minimum element from the unsorted portion and places it at the beginning of the sorted portion.",
    pseudocode: [
        "for i = 0 to n−2:",
        "  minIndex = i",
        "  for j = i+1 to n−1:",
        "    compare arr[minIndex] and arr[j]",
        "    if arr[j] < arr[minIndex]: minIndex = j",
        "  swap arr[i] and arr[minIndex]",
        "  mark arr[i] as sorted",
    ],
};
