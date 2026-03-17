export const radixSort = (array) => {
    const steps = [];
    const sortedArray = [...array];

    // Find the largest number to know how many digits we have
    const max = Math.max(...sortedArray);
    
    // Go through each digit, starting from least significant
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
        steps.push({
            indices: [],
            action: "info",
            description: `Sorting by ${exp === 1 ? 'ones' : exp === 10 ? 'tens' : 'hundreds'}`
        });

        // Creating and initializing buckets
        const buckets = Array.from({ length: 10 }, () => []);
        
        // Putting numbers into buckets
        for (let i = 0; i < sortedArray.length; i++) {
            const digit = Math.floor(sortedArray[i] / exp) % 10;
            buckets[digit].push(sortedArray[i]);
            
            steps.push({
                indices: [i],
                action: "compare",
                description: `Number ${sortedArray[i]} goes to bucket ${digit} (${digit}th digit)`
            });
        }

        // Merging buckets back into array
        let currentIndex = 0;
        for (let digit = 0; digit < 10; digit++) {
            for (let num of buckets[digit]) {
                steps.push({
                    indices: [currentIndex],
                    action: "write",
                    description: `Returning number ${num} from bucket ${digit} to position ${currentIndex}`
                });
                
                sortedArray[currentIndex] = num;
                currentIndex++;
            }
        }

        steps.push({
            indices: Array.from({length: sortedArray.length}, (_, i) => i),
            action: "fixed",
            description: `Array is sorted by ${exp === 1 ? 'ones' : exp === 10 ? 'tens' : 'hundreds'}`
        });
    }

    return {
        steps,
        sortedArray
    };
};

export const radixSortInfo = {
    name: "Radix Sort",
    timeComplexity: {
        best: "O(nk)",
        average: "O(nk)",
        worst: "O(nk)"
    },
    spaceComplexity: "O(n + k)",
    description: "Radix Sort is a non-comparative sorting algorithm that sorts numbers digit by digit, starting from the least significant digit. It uses buckets (0-9) to sort numbers based on the current digit."
}; 