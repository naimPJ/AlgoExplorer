export const quickSort = (array) => {
    const steps = [];
    const sortedArray = [...array];
    let iterNum = 0;

    const partition = (low, high) => {
        iterNum++;
        const iteration = iterNum;
        const pivot = sortedArray[high];

        steps.push({
            indices: [high],
            action: "pivot",
            description: `Selected pivot element: ${pivot}`,
            iteration,
        });

        let i = low - 1;

        for (let j = low; j < high; j++) {
            steps.push({
                indices: [j, high],
                action: "compare",
                description: `Comparing element ${sortedArray[j]} with pivot ${pivot}`,
                iteration,
            });

            if (sortedArray[j] <= pivot) {
                i++;
                if (i !== j) {
                    [sortedArray[i], sortedArray[j]] = [sortedArray[j], sortedArray[i]];
                    steps.push({
                        indices: [i, j],
                        action: "swap",
                        description: `Swapping elements ${sortedArray[i]} and ${sortedArray[j]}`,
                        iteration,
                    });
                }
            }
        }

        if (i + 1 !== high) {
            [sortedArray[i + 1], sortedArray[high]] = [sortedArray[high], sortedArray[i + 1]];
            steps.push({
                indices: [i + 1, high],
                action: "swap",
                description: `Placing pivot in its final position`,
                iteration,
            });
        }

        steps.push({
            indices: [i + 1],
            action: "fixed",
            description: `Element ${sortedArray[i + 1]} is in its final position`,
            iteration,
        });

        return i + 1;
    };

    const quickSortHelper = (low, high) => {
        if (low < high) {
            const pi = partition(low, high);
            quickSortHelper(low, pi - 1);
            quickSortHelper(pi + 1, high);
        }
    };

    quickSortHelper(0, sortedArray.length - 1);

    return { steps, sortedArray };
};

export const quickSortInfo = {
    name: "Quick Sort",
    timeComplexity: {
        best: "O(n log n)",
        average: "O(n log n)",
        worst: "O(n²)"
    },
    spaceComplexity: "O(log n)",
    description: "Quick Sort is an efficient, in-place sorting algorithm that uses a divide-and-conquer strategy. It works by selecting a 'pivot' element and partitioning the array around it."
};
