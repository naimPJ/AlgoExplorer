import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as d3 from "d3";
import "./VisualizationCanvas.css";
import MergeCanvas from "./MergeCanvas";
import CountingCanvas from "./CountingCanvas";
import AlgoChat from "./AlgoChat";

const MERGE_ALGORITHMS    = new Set(['mergeSort', 'bottomUpMergeSort']);
const SNAPSHOT_ALGORITHMS = new Set(['mergeSort', 'bottomUpMergeSort', 'countingSort']);

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
    default: "#3b82f6",
    comparing: "#f59e0b",
    swapping: "#ef4444",
    fixed: "#10b981",
    pivot: "#8b5cf6",
    writing: "#f97316"
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
    const isMerge    = MERGE_ALGORITHMS.has(algorithm);
    const isCounting = algorithm === 'countingSort';
    const isSnapshot = SNAPSHOT_ALGORITHMS.has(algorithm);
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
    const [log, setLog] = useState([]);

    // Chat context — snapshot of current execution state for the AI
    const chatContext = useMemo(() => ({
        algorithm:      algorithmInfo?.name ?? algorithm,
        timeComplexity: algorithmInfo?.timeComplexity,
        stepIndex,
        totalSteps:     steps.length,
        currentStep:    steps[stepIndex] ?? null,
        recentSteps:    log.slice(0, 8).map(e => e.description),
        array:          currentArray,
    }), [algorithmInfo, algorithm, stepIndex, steps, log, currentArray]);

    // Inicijalizacija algoritma
    useEffect(() => {
        setCurrentArray([...array]);
        setStepIndex(0);
        setSteps([]);
        setIsPlaying(false);
        setLog([]);
        
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
        if (isSnapshot || !svgRef.current || currentArray.length === 0) return;

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
            .attr("fill", "#9ca3af")
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

                // Snapshot-based algorithms (merge variants) carry the full
                // array in each step — no mutation needed here.
                if (!step.array) {
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
                }

                setLog(prev => [{ id: stepIndex, action: step.action, description: step.description, iteration: step.iteration }, ...prev]);
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
        setLog([]);
    };
    const handleSpeedChange = (newSpeed) => setSpeed(Number(newSpeed));

    const handleLogEntryClick = (entry) => {
        const targetIdx = entry.id;
        setIsPlaying(false);

        if (isSnapshot) {
            setStepIndex(targetIdx);
        } else {
            // Replay mutations from the original array up to (but not including) targetIdx
            const arr = [...array];
            for (let i = 0; i < targetIdx; i++) {
                const s = steps[i];
                if (s.action === 'swap') {
                    const [a, b] = s.indices;
                    [arr[a], arr[b]] = [arr[b], arr[a]];
                } else if (s.action === 'write') {
                    const [index] = s.indices;
                    const newValue = parseInt(s.description.match(/\d+/)[0]);
                    arr[index] = newValue;
                }
            }
            setCurrentArray(arr);
            setStepIndex(targetIdx);
        }

        // Trim log to only the steps that have already been executed before this point
        setLog(prev => prev.filter(e => e.id < targetIdx));
    };

    return (
        <div className="viz-chat-layout">
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
                    {isMerge ? (
                        <MergeCanvas
                            step={steps[stepIndex] ?? null}
                            dimensions={dimensions}
                        />
                    ) : isCounting ? (
                        <CountingCanvas
                            step={steps[stepIndex] ?? null}
                            dimensions={dimensions}
                        />
                    ) : (
                        <svg
                            ref={svgRef}
                            width={dimensions.width}
                            height={dimensions.height}
                            className="visualization-canvas"
                        />
                    )}
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

            {/* Execution Log */}
            <div className="execution-log">
                <div className="execution-log-header">
                    <span className="execution-log-title">Execution Log</span>
                    {log.length > 0 && (
                        <div className="execution-log-counters">
                            <span className="execution-log-count">{log.length} steps</span>
                            {log[0]?.iteration != null && (
                                <span className="execution-log-iteration">Iteration {log[0].iteration}</span>
                            )}
                        </div>
                    )}
                </div>
                <div className="execution-log-entries">
                    {log.length === 0 ? (
                        <p className="execution-log-empty">Log will appear here once the algorithm starts.</p>
                    ) : (
                        log.map((entry) => (
                            <div
                                key={entry.id}
                                className={`log-entry log-entry--${entry.action} log-entry--clickable`}
                                onClick={() => handleLogEntryClick(entry)}
                            >
                                <span className="log-entry-badge">{entry.action}</span>
                                <span className="log-entry-text">{entry.description}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
        <AlgoChat context={chatContext} isRunning={stepIndex > 0} />
        </div>
    );
};

export default VisualizationCanvas;