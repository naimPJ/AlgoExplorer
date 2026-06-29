export const mergeSort = (array) => {
    const steps = [];
    const arr = [...array];
    let iterNum = 0;

    let segments = [[0, arr.length]];

    const snap = () => segments.map(s => [s[0], s[1]]).sort((a, b) => a[0] - b[0]);

    const splitSegment = (start, mid, end) => {
        segments = segments.filter(s => !(s[0] === start && s[1] === end));
        segments.push([start, mid], [mid, end]);
    };

    const mergeSegments = (start, mid, end) => {
        segments = segments.filter(s =>
            !((s[0] === start && s[1] === mid) || (s[0] === mid && s[1] === end))
        );
        segments.push([start, end]);
    };

    const mergeParts = (left, right, start, end) => {
        iterNum++;
        const iteration = iterNum;
        const mid = start + left.length;

        steps.push({
            action: 'merge_start',
            description: `Merging [${start}–${mid - 1}] and [${mid}–${end - 1}]`,
            array: [...arr],
            indices: [],
            segments: snap(),
            leftRange: [start, mid],
            rightRange: [mid, end],
            iteration,
            line: 6,
        });

        const merged = [];
        let i = 0, j = 0;

        while (i < left.length && j < right.length) {
            steps.push({
                action: 'compare',
                description: `Comparing ${left[i]} and ${right[j]}`,
                array: [...arr],
                indices: [start + i, mid + j],
                segments: snap(),
                leftRange: [start, mid],
                rightRange: [mid, end],
                iteration,
                line: 7,
            });
            if (left[i] <= right[j]) merged.push(left[i++]);
            else merged.push(right[j++]);
        }
        while (i < left.length) merged.push(left[i++]);
        while (j < right.length) merged.push(right[j++]);

        for (let k = 0; k < merged.length; k++) {
            arr[start + k] = merged[k];
            steps.push({
                action: 'write',
                description: `Writing ${merged[k]} to position ${start + k}`,
                array: [...arr],
                indices: [start + k],
                segments: snap(),
                leftRange: [start, mid],
                rightRange: [mid, end],
                iteration,
                line: 8,
            });
        }

        mergeSegments(start, mid, end);

        steps.push({
            action: 'merge_complete',
            description: `Merged into sorted [${start}–${end - 1}]`,
            array: [...arr],
            indices: Array.from({ length: end - start }, (_, k) => start + k),
            segments: snap(),
            activeRange: [start, end],
            leftRange: null,
            rightRange: null,
            iteration,
            line: 9,
        });

        return merged;
    };

    const sort = (start, end) => {
        if (end - start <= 1) return [arr[start]];

        const mid = Math.floor((start + end) / 2);

        splitSegment(start, mid, end);

        steps.push({
            action: 'split',
            description: `Splitting [${start}–${end - 1}] → [${start}–${mid - 1}] and [${mid}–${end - 1}]`,
            array: [...arr],
            indices: [start, end - 1],
            segments: snap(),
            leftRange: [start, mid],
            rightRange: [mid, end],
            iteration: iterNum,
            line: 3,
        });

        const left = sort(start, mid);
        const right = sort(mid, end);

        return mergeParts(left, right, start, end);
    };

    if (arr.length > 1) sort(0, arr.length);

    return { steps, sortedArray: arr };
};

export const mergeSortInfo = {
    name: "Merge Sort",
    timeComplexity: {
        best: "O(n log n)",
        average: "O(n log n)",
        worst: "O(n log n)"
    },
    spaceComplexity: "O(n)",
    description: "Divide-and-conquer algorithm that recursively splits the array in half, sorts each half, then merges the sorted halves back together.",
    pseudocode: [
        "mergeSort(arr, start, end):",
        "  if end − start ≤ 1: return",
        "  mid = (start + end) / 2",
        "  split into [start..mid] and [mid..end]",
        "  mergeSort(left half)",
        "  mergeSort(right half)",
        "  merge(left, right):",
        "    compare left[i] and right[j]",
        "    write smaller value to arr",
        "  merged segment is sorted",
    ],
};
