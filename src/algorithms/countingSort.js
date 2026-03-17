export const countingSort = (array) => {
    const steps = [];
    const sortedArray = [...array];

    // Finding min and max values
    const min = Math.min(...array);
    const max = Math.max(...array);
    const range = max - min + 1;

    steps.push({
        indices: [],
        action: "info",
        description: `Found number range: from ${min} to ${max}`
    });

    // Creating counting array
    const count = new Array(range).fill(0);

    // Counting occurrences of each element
    for (let i = 0; i < sortedArray.length; i++) {
        const num = sortedArray[i];
        count[num - min]++;
        
        steps.push({
            indices: [i],
            action: "compare",
            description: `Counting element ${num} (currently appeared ${count[num - min]} time(s))`
        });
    }

    // Modifying counting array to contain actual positions
    for (let i = 1; i < count.length; i++) {
        count[i] += count[i - 1];
        steps.push({
            indices: [],
            action: "info",
            description: `Calculating cumulative sum for number ${i + min}`
        });
    }

    // Creating auxiliary array for sorting
    const output = new Array(sortedArray.length);

    // Building sorted array
    for (let i = sortedArray.length - 1; i >= 0; i--) {
        const num = sortedArray[i];
        const pos = count[num - min] - 1;
        output[pos] = num;
        count[num - min]--;

        steps.push({
            indices: [i, pos],
            action: "write",
            description: `Placing number ${num} at position ${pos}`
        });
    }

    // Copying sorted array back to original array
    for (let i = 0; i < sortedArray.length; i++) {
        sortedArray[i] = output[i];
        steps.push({
            indices: [i],
            action: "fixed",
            description: `Element ${output[i]} is in its final position`
        });
    }

    return {
        steps,
        sortedArray
    };
};

export const countingSortInfo = {
    name: "Counting Sort",
    timeComplexity: {
        best: "O(n + k)",
        average: "O(n + k)",
        worst: "O(n + k)"
    },
    spaceComplexity: "O(k)",
    description: "Counting Sort is a non-comparative sorting algorithm that works by counting the number of objects having distinct key values, and using arithmetic to determine the positions of each key value in the output sequence."
}; 