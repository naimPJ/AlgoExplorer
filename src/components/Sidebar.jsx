// components/Sidebar.js
import React from "react";
import "./Sidebar.css";

const algorithms = [
    { id: "bubbleSort", name: "Bubble Sort" },
    { id: "selectionSort", name: "Selection Sort" },
    { id: "insertionSort", name: "Insertion Sort" },
    { id: "shellSort", name: "Shell Sort" },
    { id: "mergeSort", name: "Merge Sort" },
    { id: "bottomUpMergeSort", name: "Bottom-up Merge Sort" },
    { id: "quickSort", name: "Quick Sort" },
    { id: "radixSort", name: "Radix Sort" },
    { id: "countingSort", name: "Counting Sort" }
];

const Sidebar = ({ onAlgorithmSelect, selectedAlgorithm }) => {
    return (
        <div className="sidebar">
            <h2>Sorting Algorithms</h2>
            <div className="algorithm-list">
                {algorithms.map((algo) => (
                    <button
                        key={algo.id}
                        className={`algorithm-button ${selectedAlgorithm === algo.id ? 'selected' : ''}`}
                        onClick={() => onAlgorithmSelect(algo.id)}
                    >
                        {algo.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;
