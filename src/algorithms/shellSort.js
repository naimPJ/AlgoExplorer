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
        });

        for (let i = gap; i < sortedArray.length; i++) {
            const temp = sortedArray[i];
            let j = i;

            steps.push({
                indices: [i],
                action: "compare",
                description: `Taking element ${temp} for insertion`,
                iteration,
            });

            while (j >= gap && sortedArray[j - gap] > temp) {
                steps.push({
                    indices: [j - gap, j],
                    action: "compare",
                    description: `Comparing elements with gap ${gap}: ${sortedArray[j - gap]} and ${temp}`,
                    iteration,
                });

                sortedArray[j] = sortedArray[j - gap];
                steps.push({
                    indices: [j - gap, j],
                    action: "swap",
                    description: `Moving element ${sortedArray[j - gap]} ${gap} positions to the right`,
                    iteration,
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
    description: "Shell Sort is a generalization of Insertion Sort that allows the exchange of items that are far apart. The algorithm starts with a large gap between elements and gradually reduces it to 1, effectively becoming a regular Insertion Sort."
};
