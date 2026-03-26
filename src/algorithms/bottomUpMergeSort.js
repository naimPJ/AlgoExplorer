export const bottomUpMergeSort = (array) => {
    const steps = [];
    const arr = [...array];
    const n = arr.length;

    // Start with n individual segments
    let segments = Array.from({ length: n }, (_, i) => [i, i + 1]);

    const snap = () => segments.map(s => [s[0], s[1]]);

    const mergeSegments = (start, mid, end) => {
        segments = segments.filter(s =>
            !((s[0] === start && s[1] === mid) || (s[0] === mid && s[1] === end))
        );
        segments.push([start, end]);
        segments.sort((a, b) => a[0] - b[0]);
    };

    for (let size = 1; size < n; size *= 2) {
        steps.push({
            action: 'pass_start',
            description: `Pass: merging sub-arrays of size ${size}`,
            array: [...arr],
            indices: [],
            segments: snap(),
            leftRange: null,
            rightRange: null,
        });

        for (let leftStart = 0; leftStart < n; leftStart += 2 * size) {
            const mid = Math.min(leftStart + size, n);
            const rightEnd = Math.min(leftStart + 2 * size, n);
            if (mid >= rightEnd) continue;

            const left = arr.slice(leftStart, mid);
            const right = arr.slice(mid, rightEnd);

            steps.push({
                action: 'merge_start',
                description: `Merging [${leftStart}–${mid - 1}] and [${mid}–${rightEnd - 1}]`,
                array: [...arr],
                indices: [],
                segments: snap(),
                leftRange: [leftStart, mid],
                rightRange: [mid, rightEnd],
            });

            let i = 0, j = 0, k = leftStart;

            while (i < left.length && j < right.length) {
                steps.push({
                    action: 'compare',
                    description: `Comparing ${left[i]} and ${right[j]}`,
                    array: [...arr],
                    indices: [leftStart + i, mid + j],
                    segments: snap(),
                    leftRange: [leftStart, mid],
                    rightRange: [mid, rightEnd],
                });

                if (left[i] <= right[j]) {
                    arr[k++] = left[i++];
                } else {
                    arr[k++] = right[j++];
                }

                steps.push({
                    action: 'write',
                    description: `Writing ${arr[k - 1]} to position ${k - 1}`,
                    array: [...arr],
                    indices: [k - 1],
                    segments: snap(),
                    leftRange: [leftStart, mid],
                    rightRange: [mid, rightEnd],
                });
            }

            while (i < left.length) {
                arr[k++] = left[i++];
                steps.push({
                    action: 'write',
                    description: `Writing remaining ${arr[k - 1]} from left sub-array`,
                    array: [...arr],
                    indices: [k - 1],
                    segments: snap(),
                    leftRange: [leftStart, mid],
                    rightRange: [mid, rightEnd],
                });
            }

            while (j < right.length) {
                arr[k++] = right[j++];
                steps.push({
                    action: 'write',
                    description: `Writing remaining ${arr[k - 1]} from right sub-array`,
                    array: [...arr],
                    indices: [k - 1],
                    segments: snap(),
                    leftRange: [leftStart, mid],
                    rightRange: [mid, rightEnd],
                });
            }

            mergeSegments(leftStart, mid, rightEnd);

            steps.push({
                action: 'merge_complete',
                description: `Merged into sorted [${leftStart}–${rightEnd - 1}]`,
                array: [...arr],
                indices: Array.from({ length: rightEnd - leftStart }, (_, k) => leftStart + k),
                segments: snap(),
                activeRange: [leftStart, rightEnd],
                leftRange: null,
                rightRange: null,
            });
        }
    }

    return { steps, sortedArray: arr };
};

export const bottomUpMergeSortInfo = {
    name: "Bottom-up Merge Sort",
    timeComplexity: {
        best: "O(n log n)",
        average: "O(n log n)",
        worst: "O(n log n)"
    },
    spaceComplexity: "O(n)",
    description: "Iterative merge sort that builds sorted sub-arrays from the bottom up — starts merging individual elements into pairs, pairs into quads, and so on, without recursion."
};
