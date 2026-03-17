export const insertionSort = (array) => {
    const steps = [];
    const sortedArray = [...array];

    for (let i = 1; i < sortedArray.length; i++) {
        const key = sortedArray[i];
        let j = i - 1;

        steps.push({
            indices: [i],
            action: "compare",
            description: `Taking element ${key} for insertion into sorted portion`
        });

        while (j >= 0 && sortedArray[j] > key) {
            steps.push({
                indices: [j, j + 1],
                action: "compare",
                description: `Comparing elements ${sortedArray[j]} and ${key}`
            });

            sortedArray[j + 1] = sortedArray[j];
            steps.push({
                indices: [j, j + 1],
                action: "swap",
                description: `Moving element ${sortedArray[j]} to the right`
            });
            
            j--;
        }

        if (j + 1 !== i) {
            sortedArray[j + 1] = key;
            steps.push({
                indices: [j + 1],
                action: "write",
                description: `Placing element ${key} at position ${j + 1}`
            });
        }

        steps.push({
            indices: Array.from({length: i + 1}, (_, idx) => idx),
            action: "fixed",
            description: `Array portion up to position ${i} is sorted`
        });
    }

    return {
        steps,
        sortedArray
    };
};

export const insertionSortInfo = {
    name: "Insertion Sort",
    timeComplexity: {
        best: "O(n)",
        average: "O(n²)",
        worst: "O(n²)"
    },
    spaceComplexity: "O(1)",
    description: "Insertion Sort is a sorting algorithm that builds the final sorted array one item at a time. It takes one element from the input data in each iteration and finds its correct position in the already sorted portion of the array."
}; 