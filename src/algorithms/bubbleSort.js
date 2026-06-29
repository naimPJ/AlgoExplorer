export const bubbleSort = (array) => {
    const steps = [];
    const sortedArray = [...array];

    for (let i = 0; i < sortedArray.length; i++) {
        const iteration = i + 1;
        for (let j = 0; j < sortedArray.length - i - 1; j++) {
            steps.push({
                indices: [j, j + 1],
                action: "compare",
                description: `Comparing elements ${sortedArray[j]} and ${sortedArray[j + 1]}`,
                iteration,
                line: 2,
            });

            if (sortedArray[j] > sortedArray[j + 1]) {
                [sortedArray[j], sortedArray[j + 1]] = [sortedArray[j + 1], sortedArray[j]];
                steps.push({
                    indices: [j, j + 1],
                    action: "swap",
                    description: `Swapping elements ${sortedArray[j]} and ${sortedArray[j + 1]}`,
                    iteration,
                    line: 4,
                });
            }
        }
        steps.push({
            indices: [sortedArray.length - i - 1],
            action: "fixed",
            description: `Element ${sortedArray[sortedArray.length - i - 1]} is in its final position`,
            iteration,
            line: 5,
        });
    }

    return { steps, sortedArray };
};

export const bubbleSortInfo = {
    name: "Bubble Sort",
    timeComplexity: {
        best: "O(n)",
        average: "O(n²)",
        worst: "O(n²)"
    },
    spaceComplexity: "O(1)",
    description: "Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
    pseudocode: [
        "for i = 0 to n−1:",
        "  for j = 0 to n−i−2:",
        "    compare arr[j] and arr[j+1]",
        "    if arr[j] > arr[j+1]:",
        "      swap arr[j] and arr[j+1]",
        "  mark arr[n−i−1] as sorted",
    ],
};
