export const mergeSort = (array) => {
    const steps = [];
    const sortedArray = [...array];

    const merge = (left, right, startIdx) => {
        const merged = [];
        let i = 0;
        let j = 0;

        while (i < left.length && j < right.length) {
            steps.push({
                indices: [startIdx + i, startIdx + left.length + j],
                action: "compare",
                description: `Comparing elements ${left[i]} and ${right[j]}`
            });

            if (left[i] <= right[j]) {
                merged.push(left[i]);
                i++;
            } else {
                merged.push(right[j]);
                j++;
            }
        }

        while (i < left.length) {
            merged.push(left[i]);
            i++;
        }

        while (j < right.length) {
            merged.push(right[j]);
            j++;
        }

        // Copy back to the original array
        for (let k = 0; k < merged.length; k++) {
            sortedArray[startIdx + k] = merged[k];
            steps.push({
                indices: [startIdx + k],
                action: "write",
                description: `Writing element ${merged[k]} to position ${startIdx + k}`
            });
        }

        return merged;
    };

    const mergeSortHelper = (startIdx, endIdx) => {
        if (endIdx - startIdx <= 1) return [sortedArray[startIdx]];

        const middleIdx = Math.floor((startIdx + endIdx) / 2);
        
        steps.push({
            indices: [startIdx, middleIdx, endIdx],
            action: "split",
            description: `Splitting array into two parts: [${startIdx}-${middleIdx}] and [${middleIdx + 1}-${endIdx}]`
        });

        const left = mergeSortHelper(startIdx, middleIdx);
        const right = mergeSortHelper(middleIdx, endIdx);
        
        return merge(left, right, startIdx);
    };

    mergeSortHelper(0, sortedArray.length);

    return {
        steps,
        sortedArray
    };
};

export const mergeSortInfo = {
    name: "Merge Sort",
    timeComplexity: {
        best: "O(n log n)",
        average: "O(n log n)",
        worst: "O(n log n)"
    },
    spaceComplexity: "O(n)",
    description: "Merge Sort is a stable sorting algorithm that uses a divide-and-conquer strategy. It divides the array into smaller subarrays, sorts them, and then merges the sorted subarrays back together."
}; 