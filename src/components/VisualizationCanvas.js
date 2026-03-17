import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import "./VisualizationCanvas.css";

// Importi za algoritme
import { bubbleSort, bubbleSortInfo } from "../algorithms/bubbleSort";
import { quickSort, quickSortInfo } from "../algorithms/quickSort";
import { mergeSort, mergeSortInfo } from "../algorithms/mergeSort";
import { selectionSort, selectionSortInfo } from "../algorithms/selectionSort";
import { insertionSort, insertionSortInfo } from "../algorithms/insertionSort";
import { shellSort, shellSortInfo } from "../algorithms/shellSort";
import { radixSort, radixSortInfo } from "../algorithms/radixSort";
import { countingSort, countingSortInfo } from "../algorithms/countingSort";
import { bottomUpMergeSort, bottomUpMergeSortInfo } from "../algorithms/bottomUpMergeSort";

// Konstante
const ANIMATION_SPEED = 700;
const TRANSITION_DURATION = 300;

const BAR_COLORS = {
    default: "#4CAF50",
    comparing: "#FFC107",
    swapping: "#F44336",
    fixed: "#2196F3",
    pivot: "#9C27B0",
    writing: "#FF9800"
};

// Mapa algoritama
const ALGORITHM_MAP = {
    bubbleSort: { func: bubbleSort, info: bubbleSortInfo },
    quickSort: { func: quickSort, info: quickSortInfo },
    mergeSort: { func: mergeSort, info: mergeSortInfo },
    selectionSort: { func: selectionSort, info: selectionSortInfo },
    insertionSort: { func: insertionSort, info: insertionSortInfo },
    shellSort: { func: shellSort, info: shellSortInfo },
    radixSort: { func: radixSort, info: radixSortInfo },
    countingSort: { func: countingSort, info: countingSortInfo },
    bottomUpMergeSort: { func: bottomUpMergeSort, info: bottomUpMergeSortInfo }
};

const VisualizationCanvas = ({ array, algorithm }) => {
    // Refs
    const svgRef = useRef(null);
    const containerRef = useRef(null);

    // State
    const [isPlaying, setIsPlaying] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [steps, setSteps] = useState([]);
    const [currentArray, setCurrentArray] = useState([]);
    const [speed, setSpeed] = useState(1);
    const [algorithmInfo, setAlgorithmInfo] = useState(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Inicijalizacija algoritma
    useEffect(() => {
        setCurrentArray([...array]);
        setStepIndex(0);
        setSteps([]);
        setIsPlaying(false);
        
        if (ALGORITHM_MAP[algorithm]) {
            const { steps } = ALGORITHM_MAP[algorithm].func(array);
            setSteps(steps);
            setAlgorithmInfo(ALGORITHM_MAP[algorithm].info);
        }
    }, [array, algorithm]);

    // Responsive dimenzije
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({ width, height });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // D3 vizualizacija
    const updateVisualization = useCallback(() => {
        if (!svgRef.current || currentArray.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const margin = { top: 40, right: 40, bottom: 40, left: 40 };
        const width = dimensions.width - margin.left - margin.right;
        const height = dimensions.height - margin.top - margin.bottom;

        const container = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Scales
        const yScale = d3.scaleLinear()
            .domain([0, Math.max(...currentArray) * 1.2])
            .range([height, 0]);

        const xScale = d3.scaleBand()
            .domain(currentArray.map((_, i) => i))
            .range([0, width])
            .padding(0.2);

        // Axis
        const xAxis = d3.axisBottom(xScale)
            .tickFormat(i => currentArray[i]);
        
        const yAxis = d3.axisLeft(yScale)
            .ticks(5);

        container.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .style("font-size", "12px");

        container.append("g")
            .call(yAxis)
            .style("font-size", "12px");

        // Bars
        const bars = container
            .selectAll(".bar")
            .data(currentArray)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d, i) => xScale(i))
            .attr("y", d => yScale(d))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d))
            .attr("fill", BAR_COLORS.default)
            .attr("rx", 4)
            .attr("ry", 4)
            .style("filter", "drop-shadow(0px 2px 2px rgba(0,0,0,0.1))");

        // Labels
        container
            .selectAll(".bar-label")
            .data(currentArray)
            .enter()
            .append("text")
            .attr("class", "bar-label")
            .attr("x", (d, i) => xScale(i) + xScale.bandwidth() / 2)
            .attr("y", d => yScale(d) - 10)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("fill", "#1e40af")
            .text(d => d);

        // Update colors based on current step
        if (steps[stepIndex]) {
            const { indices, action } = steps[stepIndex];
            
            indices.forEach(index => {
                const bar = d3.select(bars.nodes()[index]);
                bar
                    .transition()
                    .duration(TRANSITION_DURATION / 2)
                    .attr("fill", BAR_COLORS[action])
                    .style("filter", "drop-shadow(0px 4px 4px rgba(0,0,0,0.2))");

                if (action === "comparing" || action === "swapping") {
                    bar
                        .transition()
                        .duration(TRANSITION_DURATION / 4)
                        .attr("y", d => yScale(d) - 5)
                        .transition()
                        .duration(TRANSITION_DURATION / 4)
                        .attr("y", d => yScale(d));
                }
            });
        }
    }, [currentArray, stepIndex, steps, dimensions]);

    // Update visualization when data changes
    useEffect(() => {
        updateVisualization();
    }, [updateVisualization]);

    // Animation logic
    useEffect(() => {
        let timeoutId;
        
        if (isPlaying && stepIndex < steps.length) {
            timeoutId = setTimeout(() => {
                const step = steps[stepIndex];
                
                if (step.action === "swap") {
                    const [i, j] = step.indices;
                    const newArray = [...currentArray];
                    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
                    setCurrentArray(newArray);
                } else if (step.action === "write") {
                    const [index] = step.indices;
                    const newArray = [...currentArray];
                    const newValue = parseInt(step.description.match(/\d+/)[0]);
                    newArray[index] = newValue;
                    setCurrentArray(newArray);
                }
                
                setStepIndex(prev => prev + 1);
            }, ANIMATION_SPEED / speed);
        } else if (stepIndex >= steps.length) {
            setIsPlaying(false);
        }
        
        return () => clearTimeout(timeoutId);
    }, [isPlaying, stepIndex, steps, currentArray, speed]);

    // Event handlers
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleReset = () => {
        setIsPlaying(false);
        setStepIndex(0);
        setCurrentArray([...array]);
    };
    const handleSpeedChange = (newSpeed) => setSpeed(Number(newSpeed));

    return (
        <div className="visualization-wrapper">
            {/* Algorithm Info */}
            <div className="algorithm-info">
                {algorithmInfo && (
                    <>
                        <h2>{algorithmInfo.name}</h2>
                        <p>{algorithmInfo.description}</p>
                        <div className="complexity-info">
                            <p>Time complexity:</p>
                            <ul>
                                <li>Best case: {algorithmInfo.timeComplexity.best}</li>
                                <li>Average case: {algorithmInfo.timeComplexity.average}</li>
                                <li>Worst case: {algorithmInfo.timeComplexity.worst}</li>
                            </ul>
                            <p>Space complexity: {algorithmInfo.spaceComplexity}</p>
                        </div>
                    </>
                )}
            </div>

            {/* Visualization Group */}
            <div className="visualization-group">
                {/* Visualization Canvas */}
                <div className="visualization-container" ref={containerRef}>
                    <svg 
                        ref={svgRef} 
                        width={dimensions.width} 
                        height={dimensions.height}
                        className="visualization-canvas"
                    />
                </div>

                {/* Controls */}
                <div className="controls">
                    <button 
                        onClick={handlePlay} 
                        disabled={isPlaying || stepIndex >= steps.length}
                        className="control-button"
                    >
                        Play
                    </button>
                    <button 
                        onClick={handlePause} 
                        disabled={!isPlaying}
                        className="control-button"
                    >
                        Pause
                    </button>
                    <button 
                        onClick={handleReset}
                        className="control-button"
                    >
                        Reset
                    </button>
                    <div className="speed-control">
                        <label>Speed:</label>
                        <select 
                            value={speed} 
                            onChange={(e) => handleSpeedChange(e.target.value)}
                        >
                            <option value={0.5}>0.5x</option>
                            <option value={1}>1x</option>
                            <option value={2}>2x</option>
                            <option value={4}>4x</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Step Description */}
            <div className="algorithm-step">
                {steps[stepIndex] && (
                    <p>{steps[stepIndex].description}</p>
                )}
            </div>
        </div>
    );
};

export default VisualizationCanvas; 