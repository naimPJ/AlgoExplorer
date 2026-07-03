import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { bubbleSort, bubbleSortInfo } from "../algorithms/bubbleSort";
import { quickSort, quickSortInfo } from "../algorithms/quickSort";
import { mergeSort, mergeSortInfo } from "../algorithms/mergeSort";
import { selectionSort, selectionSortInfo } from "../algorithms/selectionSort";
import { insertionSort, insertionSortInfo } from "../algorithms/insertionSort";
import { shellSort, shellSortInfo } from "../algorithms/shellSort";
import { radixSort, radixSortInfo } from "../algorithms/radixSort";
import { countingSort, countingSortInfo } from "../algorithms/countingSort";
import { bottomUpMergeSort, bottomUpMergeSortInfo } from "../algorithms/bottomUpMergeSort";
import { timsort, timsortInfo } from "../algorithms/timsort";

const ALGORITHM_MAP = {
    bubbleSort:        { func: bubbleSort,        info: bubbleSortInfo        },
    quickSort:         { func: quickSort,         info: quickSortInfo         },
    mergeSort:         { func: mergeSort,         info: mergeSortInfo         },
    selectionSort:     { func: selectionSort,     info: selectionSortInfo     },
    insertionSort:     { func: insertionSort,     info: insertionSortInfo     },
    shellSort:         { func: shellSort,         info: shellSortInfo         },
    radixSort:         { func: radixSort,         info: radixSortInfo         },
    countingSort:      { func: countingSort,      info: countingSortInfo      },
    bottomUpMergeSort: { func: bottomUpMergeSort, info: bottomUpMergeSortInfo },
    timsort:           { func: timsort,           info: timsortInfo           },
};

const BAR_COLORS = {
    default:   "#3b82f6",
    compare:   "#f59e0b",
    swap:      "#ef4444",
    fixed:     "#10b981",
    pivot:     "#8b5cf6",
    write:     "#f97316",
};

const TRANSITION_DURATION = 200;

const formatTime = (ms) => {
    if (ms < 10000) return (ms / 1000).toFixed(2) + "s";
    return (ms / 1000).toFixed(1) + "s";
};

const RacePanel = ({ array, algorithm, stepIndex, accentColor, label, isPlaying }) => {
    const svgRef       = useRef(null);
    const containerRef = useRef(null);
    const [steps, setSteps]               = useState([]);
    const [currentArray, setCurrentArray] = useState([]);
    const [dimensions, setDimensions]     = useState({ width: 0, height: 0 });
    const [elapsed, setElapsed]           = useState(0);
    const startTimeRef   = useRef(null);
    const accumulatedRef = useRef(0);
    const intervalRef    = useRef(null);
    const info = ALGORITHM_MAP[algorithm]?.info;

    useEffect(() => {
        setCurrentArray([...array]);
        if (ALGORITHM_MAP[algorithm]) {
            const { steps: s } = ALGORITHM_MAP[algorithm].func(array);
            setSteps(s);
        }
    }, [array, algorithm]);

    // Keep currentArray in sync with stepIndex (replay mutations)
    useEffect(() => {
        if (!steps.length || !array.length) return;
        const arr = [...array];
        const target = Math.min(stepIndex, steps.length);
        for (let i = 0; i < target; i++) {
            const s = steps[i];
            if (s.array) continue;
            if (s.action === "swap") {
                const [a, b] = s.indices;
                [arr[a], arr[b]] = [arr[b], arr[a]];
            } else if (s.action === "write") {
                const [idx] = s.indices;
                const val = parseInt(s.description.match(/\d+/)[0]);
                arr[idx] = val;
            }
        }
        setCurrentArray(arr);
    }, [stepIndex, steps, array]);

    useEffect(() => {
        const update = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({ width, height });
            }
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    // Timer: runs while playing and not yet done; accumulates across pause/resume
    const stepCount = steps.length;
    const done = stepIndex >= stepCount && stepCount > 0;

    useEffect(() => {
        if (isPlaying && !done) {
            startTimeRef.current = Date.now();
            intervalRef.current = setInterval(() => {
                setElapsed(accumulatedRef.current + (Date.now() - startTimeRef.current));
            }, 50);
        } else {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            if (startTimeRef.current !== null) {
                accumulatedRef.current += Date.now() - startTimeRef.current;
                startTimeRef.current = null;
                setElapsed(accumulatedRef.current);
            }
        }
        return () => clearInterval(intervalRef.current);
    }, [isPlaying, done]);

    // Reset timer when array/algorithm changes (new race)
    useEffect(() => {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        startTimeRef.current = null;
        accumulatedRef.current = 0;
        setElapsed(0);
    }, [array, algorithm]);

    // Also reset when stepIndex goes back to 0 (manual reset)
    useEffect(() => {
        if (stepIndex === 0) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            startTimeRef.current = null;
            accumulatedRef.current = 0;
            setElapsed(0);
        }
    }, [stepIndex]);

    const draw = useCallback(() => {
        const step = steps[stepIndex - 1];
        if (!svgRef.current || currentArray.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const margin = { top: 20, right: 16, bottom: 30, left: 16 };
        const w = dimensions.width  - margin.left - margin.right;
        const h = dimensions.height - margin.top  - margin.bottom;
        if (w <= 0 || h <= 0) return;

        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        const arr = step?.array ?? currentArray;
        const displayArr = arr.length ? arr : currentArray;

        const yScale = d3.scaleLinear().domain([0, Math.max(...displayArr) * 1.2]).range([h, 0]);
        const xScale = d3.scaleBand().domain(displayArr.map((_, i) => i)).range([0, w]).padding(0.2);

        g.append("g").attr("transform", `translate(0,${h})`).call(d3.axisBottom(xScale).tickFormat(i => displayArr[i])).style("font-size", "10px");

        const bars = g.selectAll(".bar").data(displayArr).enter().append("rect")
            .attr("class", "bar")
            .attr("x", (d, i) => xScale(i))
            .attr("y", d => yScale(d))
            .attr("width", xScale.bandwidth())
            .attr("height", d => h - yScale(d))
            .attr("fill", accentColor ?? BAR_COLORS.default)
            .attr("rx", 3).attr("ry", 3);

        if (step) {
            const { indices, action } = step;
            const color = BAR_COLORS[action] ?? BAR_COLORS.default;
            indices.forEach(idx => {
                d3.select(bars.nodes()[idx])
                    .transition().duration(TRANSITION_DURATION)
                    .attr("fill", color);
            });
        }
    }, [currentArray, stepIndex, steps, dimensions, accentColor]);

    useEffect(() => { draw(); }, [draw]);

    const progress = stepCount > 0 ? Math.round((stepIndex / stepCount) * 100) : 0;

    const log = steps
        .slice(0, stepIndex)
        .map((s, i) => ({ id: i, action: s.action, description: s.description, iteration: s.iteration }))
        .reverse();

    return (
        <div className="race-panel">
            <div className="race-panel-header">
                <span className="race-panel-name" style={{ color: accentColor }}>
                    {label ? `${label} — ${info?.name}` : info?.name}
                </span>
                <div className="race-panel-header-right">
                    {(elapsed > 0 || done) && (
                        <span className="race-panel-timer" style={{ color: done ? "#10b981" : "#6b7280" }}>
                            {formatTime(elapsed)}
                        </span>
                    )}
                    <span className="race-panel-progress">{done ? "Done" : `${progress}%`}</span>
                </div>
            </div>
            <div className="race-panel-canvas" ref={containerRef}>
                <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
            </div>
            <div className="race-panel-bar">
                <div className="race-panel-bar-fill" style={{ width: `${progress}%`, background: accentColor }} />
            </div>
            <div className="race-panel-log">
                <div className="race-panel-log-header">
                    <span className="race-panel-log-title">Execution Log</span>
                    <div className="race-panel-log-header-right">
                        {log.length > 0 && (
                            <span className="race-panel-log-count" style={{ background: `${accentColor}18`, color: accentColor }}>
                                {log.length} steps
                            </span>
                        )}
                        {log[0]?.iteration != null && (
                            <span className="race-panel-log-iteration">Iteration {log[0].iteration}</span>
                        )}
                    </div>
                </div>
                <div className="race-panel-log-entries">
                    {log.length === 0 ? (
                        <p className="race-panel-log-empty">Log will appear once the algorithm starts.</p>
                    ) : (
                        log.map(entry => (
                            <div key={entry.id} className={`race-log-entry race-log-entry--${entry.action}`}>
                                <span className="race-log-badge">{entry.action}</span>
                                <span className="race-log-text">{entry.description}</span>
                                {entry.iteration != null && (
                                    <span className="race-log-iteration">i{entry.iteration}</span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default RacePanel;
