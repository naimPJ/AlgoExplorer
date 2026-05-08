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
        });

        for (let j = i + 1; j < sortedArray.length; j++) {
            steps.push({
                indices: [minIndex, j],
                action: "compare",
                description: `Comparing elements ${sortedArray[minIndex]} and ${sortedArray[j]}`,
                iteration,
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
            });
            [sortedArray[i], sortedArray[minIndex]] = [sortedArray[minIndex], sortedArray[i]];
        }

        steps.push({
            indices: [i],
            action: "fixed",
            description: `Element ${sortedArray[i]} is in its final position`,
            iteration,
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
    description: "Selection Sort is a simple sorting algorithm that repeatedly finds the minimum element from the unsorted portion and places it at the beginning of the sorted portion."
};
