import React, { useState, useEffect, useRef, useMemo } from "react";
import RacePanel from "../components/RacePanel";
import { bubbleSort }        from "../algorithms/bubbleSort";
import { quickSort }         from "../algorithms/quickSort";
import { mergeSort }         from "../algorithms/mergeSort";
import { selectionSort }     from "../algorithms/selectionSort";
import { insertionSort }     from "../algorithms/insertionSort";
import { shellSort }         from "../algorithms/shellSort";
import { radixSort }         from "../algorithms/radixSort";
import { countingSort }      from "../algorithms/countingSort";
import { bottomUpMergeSort } from "../algorithms/bottomUpMergeSort";
import { timsort }           from "../algorithms/timsort";
import "./RacePage.css";

const ALGO_FUNCS = {
    bubbleSort, quickSort, mergeSort, selectionSort,
    insertionSort, shellSort, radixSort, countingSort, bottomUpMergeSort, timsort,
};

const ALGORITHM_OPTIONS = [
    { value: "bubbleSort",        label: "Bubble Sort"          },
    { value: "selectionSort",     label: "Selection Sort"       },
    { value: "insertionSort",     label: "Insertion Sort"       },
    { value: "shellSort",         label: "Shell Sort"           },
    { value: "mergeSort",         label: "Merge Sort"           },
    { value: "bottomUpMergeSort", label: "Bottom-up Merge Sort" },
    { value: "quickSort",         label: "Quick Sort"           },
    { value: "radixSort",         label: "Radix Sort"           },
    { value: "countingSort",      label: "Counting Sort"        },
    { value: "timsort",           label: "Timsort"              },
];

const ACCENT_A = "#3b82f6";
const ACCENT_B = "#a855f7";
const ANIMATION_SPEED = 700;

const RacePage = ({ onBack }) => {
    const [mode, setMode]             = useState("algorithms"); // "algorithms" | "elements"

    // algorithms mode
    const [algorithmA, setAlgorithmA] = useState("bubbleSort");
    const [algorithmB, setAlgorithmB] = useState("insertionSort");
    const [array,      setArray]      = useState([]);
    const [randomCount, setRandomCount] = useState(10);

    // elements mode
    const [algorithm,  setAlgorithm]  = useState("bubbleSort");
    const [arrayA,     setArrayA]     = useState([]);
    const [arrayB,     setArrayB]     = useState([]);
    const [randomCountA, setRandomCountA] = useState(10);
    const [randomCountB, setRandomCountB] = useState(10);

    const [stepIndex,  setStepIndex]  = useState(0);
    const [isPlaying,  setIsPlaying]  = useState(false);
    const [speed,      setSpeed]      = useState(1);
    const maxStepsRef = useRef(0);

    const panelAArray     = mode === "elements" ? arrayA : array;
    const panelBArray     = mode === "elements" ? arrayB : array;
    const panelAAlgorithm = mode === "elements" ? algorithm : algorithmA;
    const panelBAlgorithm = mode === "elements" ? algorithm : algorithmB;
    const bothReady       = panelAArray.length > 0 && panelBArray.length > 0;

    // Compute step counts directly — avoids the child-before-parent effect ordering bug
    // where onMaxSteps callbacks would be overwritten by the reset effect.
    const maxSteps = useMemo(() => {
        const countFor = (arr, algo) => {
            if (!arr.length || !ALGO_FUNCS[algo]) return 0;
            return ALGO_FUNCS[algo]([...arr]).steps.length;
        };
        return Math.max(
            countFor(panelAArray, panelAAlgorithm),
            countFor(panelBArray, panelBAlgorithm),
        );
    }, [panelAArray, panelBArray, panelAAlgorithm, panelBAlgorithm]);

    // Keep the ref in sync so the animation tick always reads a fresh value
    maxStepsRef.current = maxSteps;

    // Reset playback when inputs change
    useEffect(() => {
        setStepIndex(0);
        setIsPlaying(false);
    }, [algorithmA, algorithmB, array, algorithm, arrayA, arrayB, mode]);

    // Animation tick
    useEffect(() => {
        if (!isPlaying) return;
        const id = setTimeout(() => {
            setStepIndex(prev => {
                if (prev >= maxStepsRef.current) {
                    setIsPlaying(false);
                    return prev;
                }
                return prev + 1;
            });
        }, ANIMATION_SPEED / speed);
        return () => clearTimeout(id);
    }, [isPlaying, stepIndex, speed]);

    const handleSwitchMode = (m) => {
        setMode(m);
        setStepIndex(0);
        setIsPlaying(false);
        maxStepsRef.current = 0;
    };

    // Algorithms mode helpers
    const handleRandom = () => {
        const count = Math.min(Math.max(randomCount, 2), 30);
        setArray(Array.from({ length: count }, () => Math.floor(Math.random() * 99) + 1));
    };
    const handleArrayInput = (val) => {
        const parsed = val.split(",").map(Number).filter(n => !isNaN(n));
        setArray(parsed);
    };

    // Elements mode helpers
    const handleRandomA = () => {
        const count = Math.min(Math.max(randomCountA, 2), 30);
        setArrayA(Array.from({ length: count }, () => Math.floor(Math.random() * 99) + 1));
    };
    const handleRandomB = () => {
        const count = Math.min(Math.max(randomCountB, 2), 30);
        setArrayB(Array.from({ length: count }, () => Math.floor(Math.random() * 99) + 1));
    };
    const handleArrayAInput = (val) => {
        const parsed = val.split(",").map(Number).filter(n => !isNaN(n));
        setArrayA(parsed);
    };
    const handleArrayBInput = (val) => {
        const parsed = val.split(",").map(Number).filter(n => !isNaN(n));
        setArrayB(parsed);
    };

    const handleReset = () => {
        setIsPlaying(false);
        setStepIndex(0);
    };

    return (
        <div className="race-page">
            <div className="race-page-header">
                <button className="race-back-btn" onClick={onBack}>← Back</button>
                <h1 className="race-title">Race Mode</h1>
                <p className="race-sub">Run two algorithms side by side on the same array</p>
            </div>

            {/* Mode toggle */}
            <div className="race-mode-toggle">
                <button
                    className={`race-mode-btn${mode === "algorithms" ? " race-mode-btn--active" : ""}`}
                    onClick={() => handleSwitchMode("algorithms")}
                >
                    Different Algorithms
                </button>
                <button
                    className={`race-mode-btn${mode === "elements" ? " race-mode-btn--active" : ""}`}
                    onClick={() => handleSwitchMode("elements")}
                >
                    Different Elements
                </button>
            </div>

            {mode === "algorithms" ? (
                <>
                    {/* Shared array input */}
                    <div className="race-input-bar">
                        <input
                            type="text"
                            className="race-array-input"
                            placeholder="Enter numbers, e.g. 5, 3, 8, 1"
                            onBlur={e => handleArrayInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleArrayInput(e.target.value)}
                            key={`${algorithmA}-${algorithmB}`}
                        />
                        <div className="race-input-divider" />
                        <label className="race-count-label">Elements</label>
                        <input
                            type="number"
                            className="race-count-input"
                            value={randomCount}
                            min={2} max={30}
                            onChange={e => setRandomCount(Number(e.target.value))}
                        />
                        <button className="race-random-btn" onClick={handleRandom}>Random</button>
                    </div>

                    {/* Algorithm pickers */}
                    <div className="race-pickers">
                        <div className="race-picker">
                            <label style={{ color: ACCENT_A }}>Algorithm A</label>
                            <select value={algorithmA} onChange={e => setAlgorithmA(e.target.value)} className="race-select">
                                {ALGORITHM_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="race-vs">VS</div>
                        <div className="race-picker">
                            <label style={{ color: ACCENT_B }}>Algorithm B</label>
                            <select value={algorithmB} onChange={e => setAlgorithmB(e.target.value)} className="race-select">
                                {ALGORITHM_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Single algorithm picker */}
                    <div className="race-elements-algo">
                        <label className="race-elements-algo-label">Algorithm</label>
                        <select value={algorithm} onChange={e => setAlgorithm(e.target.value)} className="race-select race-select--wide">
                            {ALGORITHM_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Two separate array inputs */}
                    <div className="race-elements-inputs">
                        <div className="race-input-bar">
                            <span className="race-input-label" style={{ color: ACCENT_A }}>A</span>
                            <div className="race-input-divider" />
                            <input
                                type="text"
                                className="race-array-input"
                                placeholder="e.g. 5, 3, 8, 1"
                                onBlur={e => handleArrayAInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleArrayAInput(e.target.value)}
                                key={algorithm + "-a"}
                            />
                            <div className="race-input-divider" />
                            <label className="race-count-label">Elements</label>
                            <input
                                type="number"
                                className="race-count-input"
                                value={randomCountA}
                                min={2} max={30}
                                onChange={e => setRandomCountA(Number(e.target.value))}
                            />
                            <button className="race-random-btn" onClick={handleRandomA}>Random</button>
                        </div>
                        <div className="race-input-bar">
                            <span className="race-input-label" style={{ color: ACCENT_B }}>B</span>
                            <div className="race-input-divider" />
                            <input
                                type="text"
                                className="race-array-input"
                                placeholder="e.g. 9, 2, 7, 4"
                                onBlur={e => handleArrayBInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleArrayBInput(e.target.value)}
                                key={algorithm + "-b"}
                            />
                            <div className="race-input-divider" />
                            <label className="race-count-label">Elements</label>
                            <input
                                type="number"
                                className="race-count-input"
                                value={randomCountB}
                                min={2} max={30}
                                onChange={e => setRandomCountB(Number(e.target.value))}
                            />
                            <button className="race-random-btn" onClick={handleRandomB}>Random</button>
                        </div>
                    </div>
                </>
            )}

            {/* Shared playback controls */}
            <div className="race-controls">
                <button
                    className="race-ctrl-btn race-ctrl-btn--primary"
                    onClick={() => setIsPlaying(true)}
                    disabled={isPlaying || !bothReady}
                >
                    Play
                </button>
                <button
                    className="race-ctrl-btn"
                    onClick={() => setIsPlaying(false)}
                    disabled={!isPlaying}
                >
                    Pause
                </button>
                <button className="race-ctrl-btn" onClick={handleReset}>Reset</button>
                <div className="race-speed">
                    <label>Speed</label>
                    <select value={speed} onChange={e => setSpeed(Number(e.target.value))}>
                        <option value={0.5}>0.5x</option>
                        <option value={1}>1x</option>
                        <option value={2}>2x</option>
                        <option value={4}>4x</option>
                    </select>
                </div>
            </div>

            {/* Panels */}
            {bothReady ? (
                <div className="race-panels">
                    <RacePanel
                        array={panelAArray}
                        algorithm={panelAAlgorithm}
                        stepIndex={stepIndex}
                        accentColor={ACCENT_A}
                        label={mode === "elements" ? "Array A" : null}
                        isPlaying={isPlaying}
                    />
                    <RacePanel
                        array={panelBArray}
                        algorithm={panelBAlgorithm}
                        stepIndex={stepIndex}
                        accentColor={ACCENT_B}
                        label={mode === "elements" ? "Array B" : null}
                        isPlaying={isPlaying}
                    />
                </div>
            ) : (
                <div className="race-empty">
                    {mode === "algorithms"
                        ? "Enter an array or click Random to start the race."
                        : "Set both Array A and Array B to start the race."}
                </div>
            )}
        </div>
    );
};

export default RacePage;
