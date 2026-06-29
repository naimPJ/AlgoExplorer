export const radixSort = (array) => {
    const steps = [];
    const sortedArray = [...array];
    const max = Math.max(...sortedArray);
    let iterNum = 0;

    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
        iterNum++;
        const iteration = iterNum;
        const digitLabel = exp === 1 ? 'ones' : exp === 10 ? 'tens' : 'hundreds';

        steps.push({
            indices: [],
            action: "info",
            description: `Sorting by ${digitLabel}`,
            iteration,
            line: 0,
        });

        const buckets = Array.from({ length: 10 }, () => []);

        for (let i = 0; i < sortedArray.length; i++) {
            const digit = Math.floor(sortedArray[i] / exp) % 10;
            buckets[digit].push(sortedArray[i]);

            steps.push({
                indices: [i],
                action: "compare",
                description: `Number ${sortedArray[i]} goes to bucket ${digit} (${digitLabel} digit)`,
                iteration,
                line: 3,
            });
        }

        let currentIndex = 0;
        for (let digit = 0; digit < 10; digit++) {
            for (let num of buckets[digit]) {
                steps.push({
                    indices: [currentIndex],
                    action: "write",
                    description: `Returning number ${num} from bucket ${digit} to position ${currentIndex}`,
                    iteration,
                    line: 5,
                });

                sortedArray[currentIndex] = num;
                currentIndex++;
            }
        }

        steps.push({
            indices: Array.from({ length: sortedArray.length }, (_, i) => i),
            action: "fixed",
            description: `Array is sorted by ${digitLabel}`,
            iteration,
            line: 6,
        });
    }

    return { steps, sortedArray };
};

export const radixSortInfo = {
    name: "Radix Sort",
    timeComplexity: {
        best: "O(nk)",
        average: "O(nk)",
        worst: "O(nk)"
    },
    spaceComplexity: "O(n + k)",
    description: "Radix Sort is a non-comparative sorting algorithm that sorts numbers digit by digit, starting from the least significant digit. It uses buckets (0-9) to sort numbers based on the current digit.",
    pseudocode: [
        "for exp = 1; max/exp > 0; exp *= 10:",
        "  buckets = [0..9 empty lists]",
        "  for each number in arr:",
        "    digit = (number / exp) % 10",
        "    place number into bucket[digit]",
        "  rebuild arr from buckets in order",
        "  mark pass as complete",
    ],
};
