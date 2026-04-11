import React, { useState, useEffect, useRef, useCallback } from "react";
import TreeCanvas from "../components/TreeCanvas";
import * as bst from "../algorithms/bst";
import "./TreePage.css";

const SPEED_MS = { 0.5: 1200, 1: 700, 2: 350, 3: 180 };

// ── Colour map for log badges ─────────────────────────────────────────────────
const BADGE_STYLE = {
    go_left:               { bg: '#dbeafe', color: '#1e40af' },
    go_right:              { bg: '#dbeafe', color: '#1e40af' },
    insert:                { bg: '#d1fae5', color: '#065f46' },
    found:                 { bg: '#d1fae5', color: '#065f46' },
    not_found:             { bg: '#fee2e2', color: '#991b1b' },
    duplicate:             { bg: '#fef3c7', color: '#92400e' },
    delete_leaf:           { bg: '#fee2e2', color: '#991b1b' },
    delete_one_child:      { bg: '#fee2e2', color: '#991b1b' },
    find_successor:        { bg: '#ede9fe', color: '#5b21b6' },
    replace_with_successor:{ bg: '#ede9fe', color: '#5b21b6' },
    traverse_visit:        { bg: '#fef3c7', color: '#92400e' },
    traverse_done:         { bg: '#d1fae5', color: '#065f46' },
};

const LogEntry = ({ entry }) => {
    const style = BADGE_STYLE[entry.action] ?? { bg: '#f3f4f6', color: '#374151' };
    return (
        <div className="tlog-entry">
            <span className="tlog-badge" style={{ background: style.bg, color: style.color }}>
                {entry.action.replace(/_/g, ' ')}
            </span>
            <span className="tlog-text">{entry.description}</span>
        </div>
    );
};

// ── Tree Page ─────────────────────────────────────────────────────────────────
const TreePage = () => {
    const [tree,        setTree]        = useState(null);
    const [steps,       setSteps]       = useState([]);
    const [stepIdx,     setStepIdx]     = useState(0);
    const [isPlaying,   setIsPlaying]   = useState(false);
    const [pendingTree, setPendingTree] = useState(null);
    const [log,         setLog]         = useState([]);
    const [inputValue,  setInputValue]  = useState('');
    const [listInput,   setListInput]   = useState('');
    const [speed,       setSpeed]       = useState(1);
    const [traversalResult, setTraversalResult] = useState(null);
    const [canvasWidth, setCanvasWidth] = useState(0);
    const canvasRef = useRef(null);

    // Measure canvas width
    useEffect(() => {
        const measure = () => {
            if (canvasRef.current) setCanvasWidth(canvasRef.current.clientWidth);
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    // Animation loop
    useEffect(() => {
        if (!isPlaying) return;

        if (stepIdx >= steps.length) {
            setIsPlaying(false);
            if (pendingTree !== null) setTree(pendingTree);
            return;
        }

        const delay = SPEED_MS[speed] ?? 700;
        const id = setTimeout(() => {
            const s = steps[stepIdx];
            setLog(prev => [{
                id: `${Date.now()}-${stepIdx}`,
                action: s.action,
                description: s.description,
            }, ...prev]);
            setStepIdx(i => i + 1);
        }, delay);

        return () => clearTimeout(id);
    }, [isPlaying, stepIdx, steps, pendingTree, speed]);

    const runOperation = useCallback((result) => {
        setSteps(result.steps);
        setPendingTree(result.tree);
        setStepIdx(0);
        setIsPlaying(true);
        setTraversalResult(null);
    }, []);

    const getInput = () => {
        const v = parseInt(inputValue, 10);
        return isNaN(v) ? null : v;
    };

    const handleInsert = () => {
        if (isPlaying) return;
        const v = getInput();
        if (v === null) return;
        runOperation(bst.insert(tree, v));
    };

    const handleSearch = () => {
        if (isPlaying || !tree) return;
        const v = getInput();
        if (v === null) return;
        runOperation(bst.search(tree, v));
    };

    const handleDelete = () => {
        if (isPlaying || !tree) return;
        const v = getInput();
        if (v === null) return;
        runOperation(bst.remove(tree, v));
    };

    const handleTraverse = (type) => {
        if (isPlaying || !tree) return;
        const result = bst.traverse(tree, type);
        setTraversalResult(result.result);
        runOperation(result);
    };

    const handleBuildFromList = () => {
        if (isPlaying) return;
        const values = listInput
            .split(',')
            .map(s => parseInt(s.trim(), 10))
            .filter(n => !isNaN(n));
        if (values.length === 0) return;
        const newTree = bst.buildTree(values);
        setTree(newTree);
        setLog([{
            id: Date.now(),
            action: 'insert',
            description: `Built tree from list: [${values.join(', ')}]`,
        }]);
        setSteps([]);
        setStepIdx(0);
        setIsPlaying(false);
        setTraversalResult(null);
    };

    const handleRandom = () => {
        if (isPlaying) return;
        const pool = Array.from({ length: 99 }, (_, i) => i + 1);
        // Shuffle and pick 8 values, inserting first as root at ~50
        const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 7);
        // Pick a root in the middle range so the tree isn't too skewed
        const root = Math.floor(Math.random() * 30) + 35;
        const values = [root, ...shuffled.filter(v => v !== root)];
        const newTree = bst.buildTree(values);
        setTree(newTree);
        setLog([{
            id: Date.now(),
            action: 'insert',
            description: `Generated tree with values: [${values.join(', ')}]`,
        }]);
        setSteps([]);
        setStepIdx(0);
        setIsPlaying(false);
        setTraversalResult(null);
    };

    const handlePause = () => setIsPlaying(false);

    const handleReset = () => {
        setTree(null);
        setSteps([]);
        setStepIdx(0);
        setIsPlaying(false);
        setPendingTree(null);
        setLog([]);
        setTraversalResult(null);
        setInputValue('');
    };

    const currentStep = steps[stepIdx] ?? null;
    const noTree = !tree && !currentStep?.treeAfter;

    return (
        <div className="tree-page">

            {/* ── Controls ───────────────────────────────────────── */}
            <div className="tree-controls">
                <div className="tree-ctrl-group">
                    <input
                        className="tree-input"
                        type="number"
                        placeholder="Value…"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleInsert()}
                        disabled={isPlaying}
                    />
                    <button className="tree-btn tree-btn--primary" onClick={handleInsert} disabled={isPlaying}>
                        Insert
                    </button>
                    <button className="tree-btn" onClick={handleSearch} disabled={isPlaying || noTree}>
                        Search
                    </button>
                    <button className="tree-btn tree-btn--danger" onClick={handleDelete} disabled={isPlaying || noTree}>
                        Delete
                    </button>
                </div>

                <div className="tree-ctrl-divider" />

                <div className="tree-ctrl-group">
                    <span className="tree-ctrl-label">List</span>
                    <input
                        className="tree-list-input"
                        type="text"
                        placeholder="e.g. 50, 30, 70, 20"
                        value={listInput}
                        onChange={e => setListInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleBuildFromList()}
                        disabled={isPlaying}
                    />
                    <button className="tree-btn tree-btn--primary" onClick={handleBuildFromList} disabled={isPlaying}>
                        Build Tree
                    </button>
                </div>

                <div className="tree-ctrl-divider" />

                <div className="tree-ctrl-group">
                    <span className="tree-ctrl-label">Traverse</span>
                    {['inorder', 'preorder', 'postorder'].map(t => (
                        <button
                            key={t}
                            className="tree-btn tree-btn--traverse"
                            onClick={() => handleTraverse(t)}
                            disabled={isPlaying || noTree}
                        >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="tree-ctrl-divider" />

                <div className="tree-ctrl-group">
                    <button className="tree-btn tree-btn--ghost" onClick={handleRandom} disabled={isPlaying}>
                        Random tree
                    </button>
                    <button className="tree-btn tree-btn--ghost" onClick={handlePause} disabled={!isPlaying}>
                        Pause
                    </button>
                    <select
                        className="tree-speed-select"
                        value={speed}
                        onChange={e => setSpeed(Number(e.target.value))}
                    >
                        <option value={0.5}>0.5×</option>
                        <option value={1}>1×</option>
                        <option value={2}>2×</option>
                        <option value={3}>3×</option>
                    </select>
                    <button className="tree-btn tree-btn--ghost" onClick={handleReset}>
                        Reset
                    </button>
                </div>
            </div>

            {/* ── Traversal result banner ─────────────────────────── */}
            {traversalResult && currentStep?.action === 'traverse_done' && (
                <div className="traversal-banner">
                    <span className="traversal-banner-label">Result</span>
                    <span className="traversal-banner-values">
                        {traversalResult.join(' → ')}
                    </span>
                </div>
            )}

            {/* ── Main canvas + log ───────────────────────────────── */}
            <div className="tree-main">
                <div className="tree-canvas-panel" ref={canvasRef}>
                    <TreeCanvas
                        tree={tree}
                        step={currentStep}
                        width={canvasWidth}
                    />
                </div>

                <div className="tree-log-panel">
                    <div className="tree-log-header">
                        <span className="tree-log-title">Execution Log</span>
                        {log.length > 0 && (
                            <span className="tree-log-count">{log.length} steps</span>
                        )}
                    </div>
                    <div className="tree-log-entries">
                        {log.length === 0 ? (
                            <p className="tree-log-empty">
                                Log will appear here as you interact with the tree.
                            </p>
                        ) : (
                            log.map(entry => <LogEntry key={entry.id} entry={entry} />)
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default TreePage;
