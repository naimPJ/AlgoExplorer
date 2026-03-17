export const bottomUpMergeSort = (array) => {
    const steps = [];
    const sortedArray = [...array];

    const merge = (start, mid, end) => {
        const leftArray = sortedArray.slice(start, mid);
        const rightArray = sortedArray.slice(mid, end);
        let i = 0, j = 0, k = start;

        steps.push({
            indices: [start, mid - 1, mid, end - 1],
            action: "compare",
            description: `Merging subarrays [${start}-${mid-1}] and [${mid}-${end-1}]`
        });

        while (i < leftArray.length && j < rightArray.length) {
            steps.push({
                indices: [start + i, mid + j],
                action: "compare",
                description: `Comparing elements ${leftArray[i]} and ${rightArray[j]}`
            });

            if (leftArray[i] <= rightArray[j]) {
                sortedArray[k] = leftArray[i];
                steps.push({
                    indices: [k],
                    action: "write",
                    description: `Writing element ${leftArray[i]} to position ${k}`
                });
                i++;
            } else {
                sortedArray[k] = rightArray[j];
                steps.push({
                    indices: [k],
                    action: "write",
                    description: `Writing element ${rightArray[j]} to position ${k}`
                });
                j++;
            }
            k++;
        }

        while (i < leftArray.length) {
            sortedArray[k] = leftArray[i];
            steps.push({
                indices: [k],
                action: "write",
                description: `Writing remaining element ${leftArray[i]} from left subarray`
            });
            i++;
            k++;
        }

        while (j < rightArray.length) {
            sortedArray[k] = rightArray[j];
            steps.push({
                indices: [k],
                action: "write",
                description: `Writing remaining element ${rightArray[j]} from right subarray`
            });
            j++;
            k++;
        }

        steps.push({
            indices: Array.from({length: end - start}, (_, i) => start + i),
            action: "fixed",
            description: `Subarray [${start}-${end-1}] is sorted`
        });
    };

    // Bottom-up merge sort
    for (let size = 1; size < sortedArray.length; size *= 2) {
        steps.push({
            indices: [],
            action: "info",
            description: `Merging subarrays of size ${size}`
        });

        for (let leftStart = 0; leftStart < sortedArray.length; leftStart += 2 * size) {
            const mid = Math.min(leftStart + size, sortedArray.length);
            const rightEnd = Math.min(leftStart + 2 * size, sortedArray.length);
            
            if (mid < rightEnd) {
                merge(leftStart, mid, rightEnd);
            }
        }
    }

    return {
        steps,
        sortedArray
    };
};

export const bottomUpMergeSortInfo = {
    name: "Bottom-up Merge Sort",
    timeComplexity: {
        best: "O(n log n)",
        average: "O(n log n)",
        worst: "O(n log n)"
    },
    spaceComplexity: "O(n)",
    description: "Bottom-up Merge Sort is an iterative version of the Merge Sort algorithm that starts by merging individual elements into pairs, then merged pairs into quartets, and so on. It doesn't use recursion, which makes it more efficient in some cases."
}; 