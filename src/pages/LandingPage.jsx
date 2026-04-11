import React, { useState, useEffect } from "react";
import { bubbleSortInfo }       from "../algorithms/bubbleSort";
import { selectionSortInfo }    from "../algorithms/selectionSort";
import { insertionSortInfo }    from "../algorithms/insertionSort";
import { shellSortInfo }        from "../algorithms/shellSort";
import { mergeSortInfo }        from "../algorithms/mergeSort";
import { bottomUpMergeSortInfo } from "../algorithms/bottomUpMergeSort";
import { quickSortInfo }        from "../algorithms/quickSort";
import { radixSortInfo }        from "../algorithms/radixSort";
import { countingSortInfo }     from "../algorithms/countingSort";
import "./LandingPage.css";

const META = {
    bubbleSort:        { accent: "#f59e0b", category: "Comparison",      preview: [3,7,1,5,9,2,8,4] },
    selectionSort:     { accent: "#f97316", category: "Comparison",      preview: [6,2,8,1,7,3,9,5] },
    insertionSort:     { accent: "#eab308", category: "Comparison",      preview: [5,3,8,2,7,4,9,1] },
    shellSort:         { accent: "#6366f1", category: "Comparison",      preview: [7,2,9,1,6,3,8,4] },
    mergeSort:         { accent: "#3b82f6", category: "Divide & Conquer",preview: [4,9,1,7,2,8,3,6] },
    bottomUpMergeSort: { accent: "#0ea5e9", category: "Divide & Conquer",preview: [8,1,6,3,9,2,7,4] },
    quickSort:         { accent: "#a855f7", category: "Divide & Conquer",preview: [9,1,8,2,7,3,6,4] },
    radixSort:         { accent: "#10b981", category: "Non-comparison",  preview: [6,3,9,1,8,2,7,4] },
    countingSort:      { accent: "#14b8a6", category: "Non-comparison",  preview: [3,6,1,8,2,7,4,9] },
};

const ALGORITHMS = [
    { id: "bubbleSort",        info: bubbleSortInfo        },
    { id: "selectionSort",     info: selectionSortInfo     },
    { id: "insertionSort",     info: insertionSortInfo     },
    { id: "shellSort",         info: shellSortInfo         },
    { id: "mergeSort",         info: mergeSortInfo         },
    { id: "bottomUpMergeSort", info: bottomUpMergeSortInfo },
    { id: "quickSort",         info: quickSortInfo         },
    { id: "radixSort",         info: radixSortInfo         },
    { id: "countingSort",      info: countingSortInfo      },
].map(({ id, info }) => ({ id, ...info, ...META[id] }));

const complexityColor = (c) => {
    if (!c) return "#9ca3af";
    if (c === "O(1)" || c === "O(n)") return "#10b981";
    if (c.includes("log"))            return "#3b82f6";
    if (c.includes("n²"))             return "#f59e0b";
    return "#9ca3af";
};

const MiniChart = ({ values, accent }) => {
    const max    = Math.max(...values);
    const W      = 88;
    const H      = 36;
    const count  = values.length;
    const gap    = 2;
    const barW   = (W - gap * (count - 1)) / count;

    return (
        <svg width={W} height={H} className="mini-chart" aria-hidden="true">
            {values.map((v, i) => {
                const barH = Math.round((v / max) * H);
                return (
                    <rect
                        key={i}
                        x={i * (barW + gap)}
                        y={H - barH}
                        width={barW}
                        height={barH}
                        rx={2}
                        fill={accent}
                        opacity={0.25 + (v / max) * 0.45}
                    />
                );
            })}
        </svg>
    );
};

const ComplexityBadge = ({ label, value }) => (
    <div className="complexity-badge">
        <span className="complexity-badge-label">{label}</span>
        <span className="complexity-badge-value" style={{ color: complexityColor(value) }}>
            {value}
        </span>
    </div>
);

const AlgorithmCard = ({ algo, onSelect }) => (
    <div className="algo-card" style={{ "--accent": algo.accent }}>
        <div className="algo-card-top">
            <div className="algo-card-header">
                <span className="algo-category">{algo.category}</span>
                <MiniChart values={algo.preview} accent={algo.accent} />
            </div>
            <h3 className="algo-name">{algo.name}</h3>
            <p className="algo-description">{algo.description}</p>
        </div>
        <div className="algo-card-bottom">
            <div className="complexity-row">
                <ComplexityBadge label="Best"  value={algo.timeComplexity.best}    />
                <ComplexityBadge label="Avg"   value={algo.timeComplexity.average} />
                <ComplexityBadge label="Worst" value={algo.timeComplexity.worst}   />
            </div>
            <button className="algo-visualize-btn" onClick={() => onSelect(algo.id)}>
                Visualize
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
            </button>
        </div>
    </div>
);

const CATEGORIES = ["Comparison", "Divide & Conquer", "Non-comparison"];

// ── Hero live visualization ───────────────────────────────────────────────
const HERO_INITIAL = [7, 3, 9, 1, 5, 8, 2, 6, 4];

const computeHeroSteps = (arr) => {
    const steps = [];
    const a = [...arr];
    steps.push({ array: [...a], comparing: [], sortedFrom: a.length });
    for (let i = 0; i < a.length - 1; i++) {
        for (let j = 0; j < a.length - 1 - i; j++) {
            steps.push({ array: [...a], comparing: [j, j + 1], sortedFrom: a.length - i });
            if (a[j] > a[j + 1]) {
                [a[j], a[j + 1]] = [a[j + 1], a[j]];
                steps.push({ array: [...a], comparing: [j, j + 1], sortedFrom: a.length - i });
            }
        }
        steps.push({ array: [...a], comparing: [], sortedFrom: a.length - i - 1 });
    }
    steps.push({ array: [...a], comparing: [], sortedFrom: 0 });
    return steps;
};

const HERO_STEPS = computeHeroSteps(HERO_INITIAL);
const HERO_MAX   = Math.max(...HERO_INITIAL);

const barColor = (i, comparing, sortedFrom) => {
    if (i >= sortedFrom)          return "#10b981";
    if (comparing.includes(i))    return "#f59e0b";
    return "#3b82f6";
};

const HeroVisualization = () => {
    const [stepIdx, setStepIdx] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setStepIdx(prev => (prev + 1) % HERO_STEPS.length);
        }, 420);
        return () => clearInterval(id);
    }, []);

    const { array, comparing, sortedFrom } = HERO_STEPS[stepIdx];

    return (
        <div className="hero-visual">
            <div className="hero-chart-card">
                <div className="hero-chart-header">
                    <span className="hero-chart-label">Bubble Sort</span>
                    <span className="hero-chart-step">
                        Step {stepIdx + 1} / {HERO_STEPS.length}
                    </span>
                </div>
                <div className="hero-chart">
                    {array.map((val, i) => (
                        <div
                            key={i}
                            className="hero-bar"
                            style={{
                                height: `${(val / HERO_MAX) * 100}%`,
                                background: barColor(i, comparing, sortedFrom),
                            }}
                        />
                    ))}
                </div>
                <div className="hero-chart-legend">
                    <span className="hcl-item">
                        <span className="hcl-dot" style={{ background: "#3b82f6" }} />
                        Unsorted
                    </span>
                    <span className="hcl-item">
                        <span className="hcl-dot" style={{ background: "#f59e0b" }} />
                        Comparing
                    </span>
                    <span className="hcl-item">
                        <span className="hcl-dot" style={{ background: "#10b981" }} />
                        Sorted
                    </span>
                </div>
            </div>
        </div>
    );
};

const BSTCard = ({ onOpenTree }) => (
    <div className="algo-card bst-card" style={{ "--accent": "#8b5cf6" }}>
        <div className="algo-card-top">
            <div className="algo-card-header">
                <span className="algo-category">Data Structure</span>
                <svg width="88" height="36" aria-hidden="true" viewBox="0 0 88 36">
                    {/* Simple tree icon */}
                    <circle cx="44" cy="7"  r="5" fill="#8b5cf6" opacity="0.7" />
                    <circle cx="24" cy="22" r="5" fill="#8b5cf6" opacity="0.55" />
                    <circle cx="64" cy="22" r="5" fill="#8b5cf6" opacity="0.55" />
                    <circle cx="14" cy="34" r="4" fill="#8b5cf6" opacity="0.4" />
                    <circle cx="34" cy="34" r="4" fill="#8b5cf6" opacity="0.4" />
                    <circle cx="54" cy="34" r="4" fill="#8b5cf6" opacity="0.4" />
                    <circle cx="74" cy="34" r="4" fill="#8b5cf6" opacity="0.4" />
                    <line x1="44" y1="12" x2="24" y2="17" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.4" />
                    <line x1="44" y1="12" x2="64" y2="17" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.4" />
                    <line x1="24" y1="27" x2="14" y2="30" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.3" />
                    <line x1="24" y1="27" x2="34" y2="30" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.3" />
                    <line x1="64" y1="27" x2="54" y2="30" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.3" />
                    <line x1="64" y1="27" x2="74" y2="30" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.3" />
                </svg>
            </div>
            <h3 className="algo-name">Binary Search Tree</h3>
            <p className="algo-description">
                Interactively insert, search, and delete nodes. Watch the BST maintain its ordering property — step by step through the execution log.
            </p>
        </div>
        <div className="algo-card-bottom">
            <div className="complexity-row">
                <div className="complexity-badge"><span className="complexity-badge-label">Search</span><span className="complexity-badge-value" style={{ color: "#3b82f6" }}>O(log n)</span></div>
                <div className="complexity-badge"><span className="complexity-badge-label">Insert</span><span className="complexity-badge-value" style={{ color: "#3b82f6" }}>O(log n)</span></div>
                <div className="complexity-badge"><span className="complexity-badge-label">Delete</span><span className="complexity-badge-value" style={{ color: "#f59e0b" }}>O(log n)</span></div>
            </div>
            <button className="algo-visualize-btn" onClick={onOpenTree}>
                Explore
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
            </button>
        </div>
    </div>
);

const LandingPage = ({ onSelect, onOpenTree }) => (
    <div className="landing">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="hero">
            <div className="hero-content">
                <span className="hero-tag">AlgoExplorer</span>
                <h1 className="hero-title">Watch algorithms<br />think in real time</h1>
                <p className="hero-sub">
                    Explore classic sorting algorithms and interactive data structures — step through every comparison,
                    swap, and merge at your own pace.
                </p>
                <div className="hero-stats">
                    <span>Sorting Algorithms</span>
                    <span className="hero-stat-dot" />
                    <span>Data Structures</span>
                    <span className="hero-stat-dot" />
                    <span>Execution log</span>
                </div>
            </div>
            <HeroVisualization />
        </section>

        {/* ── Algorithm grid grouped by category ───────────────── */}
        {CATEGORIES.map(cat => {
            const group = ALGORITHMS.filter(a => a.category === cat);
            return (
                <section key={cat} className="algo-section">
                    <h2 className="algo-section-title">{cat} Sorts</h2>
                    <div className="algo-grid">
                        {group.map(algo => (
                            <AlgorithmCard key={algo.id} algo={algo} onSelect={onSelect} />
                        ))}
                    </div>
                </section>
            );
        })}

        {/* ── Data Structures ───────────────────────────────────── */}
        <section className="algo-section">
            <h2 className="algo-section-title">Data Structures</h2>
            <div className="algo-grid">
                <BSTCard onOpenTree={onOpenTree} />
            </div>
        </section>

    </div>
);

export default LandingPage;
