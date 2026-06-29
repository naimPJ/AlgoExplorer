export const shellSort = (array) => {
    const steps = [];
    const sortedArray = [...array];

    let gap = 1;
    while (gap < sortedArray.length / 3) {
        gap = 3 * gap + 1;
    }

    let iterNum = 0;

    while (gap > 0) {
        iterNum++;
        const iteration = iterNum;

        steps.push({
            indices: [],
            action: "info",
            description: `Setting gap to ${gap}`,
            iteration,
            line: 1,
        });

        for (let i = gap; i < sortedArray.length; i++) {
            const temp = sortedArray[i];
            let j = i;

            steps.push({
                indices: [i],
                action: "compare",
                description: `Taking element ${temp} for insertion`,
                iteration,
                line: 3,
            });

            while (j >= gap && sortedArray[j - gap] > temp) {
                steps.push({
                    indices: [j - gap, j],
                    action: "compare",
                    description: `Comparing elements with gap ${gap}: ${sortedArray[j - gap]} and ${temp}`,
                    iteration,
                    line: 4,
                });

                sortedArray[j] = sortedArray[j - gap];
                steps.push({
                    indices: [j - gap, j],
                    action: "swap",
                    description: `Moving element ${sortedArray[j - gap]} ${gap} positions to the right`,
                    iteration,
                    line: 6,
                });

                j -= gap;
            }

            if (j !== i) {
                sortedArray[j] = temp;
                steps.push({
                    indices: [j],
                    action: "write",
                    description: `Placing element ${temp} at position ${j}`,
                    iteration,
                    line: 8,
                });
            }
        }

        gap = Math.floor(gap / 3);
    }

    steps.push({
        indices: Array.from({ length: sortedArray.length }, (_, i) => i),
        action: "fixed",
        description: "Array is sorted",
        iteration: iterNum,
        line: 10,
    });

    return { steps, sortedArray };
};

export const shellSortInfo = {
    name: "Shell Sort",
    timeComplexity: {
        best: "O(n log n)",
        average: "O(n^(4/3))",
        worst: "O(n^(3/2))"
    },
    spaceComplexity: "O(1)",
    description: "Shell Sort is a generalization of Insertion Sort that allows the exchange of items that are far apart. The algorithm starts with a large gap between elements and gradually reduces it to 1, effectively becoming a regular Insertion Sort.",
    pseudocode: [
        "gap = n / 2",
        "while gap > 0:",
        "  for i = gap to n−1:",
        "    key = arr[i], j = i",
        "    compare arr[j−gap] and key",
        "    while j ≥ gap and arr[j−gap] > key:",
        "      shift arr[j−gap] right by gap",
        "      j = j − gap",
        "    place key at arr[j]",
        "  gap = gap / 2",
        "mark array as sorted",
    ],
};
