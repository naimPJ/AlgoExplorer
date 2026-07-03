// Timsort — hybrid sort that builds small sorted "runs" with insertion sort,
// then merges adjacent runs pairwise (bottom-up). Emits the default
// (non-snapshot) step shape so it renders on the standard bar canvas:
//   { indices, action, description, iteration, line }
// Actions used: compare / swap / write / fixed.
//
// Note: real Timsort uses MIN_RUN of 32–64; visualizer arrays are short, so a
// smaller run size keeps both the run phase and the merge phase visible.
const MIN_RUN = 8;

export const timsort = (array) => {
    const steps = [];
    const sortedArray = [...array];
    const n = sortedArray.length;
    let iteration = 0;

    // --- Run phase: insertion-sort each chunk of size MIN_RUN in place ---
    const insertionSortRange = (start, end) => {
        iteration++;
        for (let i = start + 1; i < end; i++) {
            const key = sortedArray[i];
            let j = i - 1;

            steps.push({
                indices: [i],
                action: "compare",
                description: `Taking element ${key} for insertion into the current run`,
                iteration,
                line: 2,
            });

            while (j >= start && sortedArray[j] > key) {
                steps.push({
                    indices: [j, j + 1],
                    action: "compare",
                    description: `Comparing elements ${sortedArray[j]} and ${key}`,
                    iteration,
                    line: 3,
                });

                sortedArray[j + 1] = sortedArray[j];
                steps.push({
                    indices: [j, j + 1],
                    action: "swap",
                    description: `Moving element ${sortedArray[j]} to the right`,
                    iteration,
                    line: 3,
                });

                j--;
            }

            if (j + 1 !== i) {
                sortedArray[j + 1] = key;
                steps.push({
                    indices: [j + 1],
                    action: "write",
                    description: `Placing element ${key} at position ${j + 1}`,
                    iteration,
                    line: 3,
                });
            }
        }

        steps.push({
            indices: Array.from({ length: end - start }, (_, idx) => start + idx),
            action: "fixed",
            description: `Run [${start}–${end - 1}] is now sorted`,
            iteration,
            line: 1,
        });
    };

    for (let start = 0; start < n; start += MIN_RUN) {
        const end = Math.min(start + MIN_RUN, n);
        insertionSortRange(start, end);
    }

    // --- Merge phase: bottom-up merge of adjacent runs ---
    const merge = (start, mid, end) => {
        iteration++;
        const left = sortedArray.slice(start, mid);
        const right = sortedArray.slice(mid, end);

        let i = 0, j = 0, k = start;

        while (i < left.length && j < right.length) {
            steps.push({
                indices: [start + i, mid + j],
                action: "compare",
                description: `Comparing ${left[i]} and ${right[j]} while merging runs`,
                iteration,
                line: 6,
            });

            if (left[i] <= right[j]) {
                sortedArray[k] = left[i];
                steps.push({
                    indices: [k],
                    action: "write",
                    description: `${left[i]} written to position ${k}`,
                    iteration,
                    line: 7,
                });
                i++;
            } else {
                sortedArray[k] = right[j];
                steps.push({
                    indices: [k],
                    action: "write",
                    description: `${right[j]} written to position ${k}`,
                    iteration,
                    line: 7,
                });
                j++;
            }
            k++;
        }

        while (i < left.length) {
            sortedArray[k] = left[i];
            steps.push({
                indices: [k],
                action: "write",
                description: `${left[i]} written to position ${k}`,
                iteration,
                line: 7,
            });
            i++;
            k++;
        }

        while (j < right.length) {
            sortedArray[k] = right[j];
            steps.push({
                indices: [k],
                action: "write",
                description: `${right[j]} written to position ${k}`,
                iteration,
                line: 7,
            });
            j++;
            k++;
        }

        steps.push({
            indices: Array.from({ length: end - start }, (_, idx) => start + idx),
            action: "fixed",
            description: `Merged into sorted segment [${start}–${end - 1}]`,
            iteration,
            line: 8,
        });
    };

    for (let size = MIN_RUN; size < n; size *= 2) {
        for (let start = 0; start < n; start += 2 * size) {
            const mid = Math.min(start + size, n);
            const end = Math.min(start + 2 * size, n);
            if (mid < end) merge(start, mid, end);
        }
    }

    return { steps, sortedArray };
};

export const timsortInfo = {
    name: "Timsort",
    timeComplexity: {
        best: "O(n)",
        average: "O(n log n)",
        worst: "O(n log n)"
    },
    spaceComplexity: "O(n)",
    description: "Timsort is a hybrid, stable sorting algorithm derived from merge sort and insertion sort. It first builds small sorted segments called \"runs\" using insertion sort, then repeatedly merges adjacent runs until the whole array is sorted. It is the default sort in Python and Java.",
    pseudocode: [
        "timsort(arr):",
        "  for each block of size MIN_RUN:",
        "    insertion sort the block into a run",
        "  size = MIN_RUN",
        "  while size < n:",
        "    for each pair of adjacent runs:",
        "      compare fronts of left and right run",
        "      write smaller value back into arr",
        "    merged runs form a larger sorted run",
        "    size = size * 2",
    ],
};
