import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./TreeCanvas.css";

const NODE_R      = 22;
const LEVEL_H     = 80;
const TOP_MARGIN  = 50;
const SIDE_MARGIN = 40;

// ── Layout ───────────────────────────────────────────────────────────────────
// Assigns each node an inorder index (x) and depth (y), giving a proper
// BST layout where left children are always visually to the left.
function layoutTree(root, canvasWidth) {
    if (!root) return { nodes: [], edges: [], svgHeight: 200 };

    const meta  = new Map(); // value → { inorder, depth }
    const edges = [];
    let idx = 0;

    const assignInorder = (node, depth) => {
        if (!node) return;
        assignInorder(node.left, depth + 1);
        meta.set(node.value, { inorder: idx++, depth });
        assignInorder(node.right, depth + 1);
    };

    const collectEdges = (node, parentValue) => {
        if (!node) return;
        if (parentValue !== null) edges.push({ from: parentValue, to: node.value });
        collectEdges(node.left, node.value);
        collectEdges(node.right, node.value);
    };

    assignInorder(root, 0);
    collectEdges(root, null);

    const n       = idx;
    const cellW   = Math.max(50, (canvasWidth - SIDE_MARGIN * 2) / n);
    const getPx   = (v) => SIDE_MARGIN + (meta.get(v).inorder + 0.5) * cellW;
    const getPy   = (v) => TOP_MARGIN  + meta.get(v).depth * LEVEL_H;
    const maxDepth = Math.max(...[...meta.values()].map(m => m.depth));

    const nodes = [...meta.keys()].map(v => ({
        value: v,
        px: getPx(v),
        py: getPy(v),
    }));

    const edgesWithCoords = edges.map(({ from, to }) => ({
        from, to,
        x1: getPx(from), y1: getPy(from),
        x2: getPx(to),   y2: getPy(to),
    }));

    const svgHeight = TOP_MARGIN + (maxDepth + 1) * LEVEL_H + NODE_R + 20;

    return { nodes, edges: edgesWithCoords, svgHeight };
}

// ── Node colour ───────────────────────────────────────────────────────────────
function nodeStyle(value, step) {
    if (!step) return { fill: '#3b82f6', stroke: '#2563eb', text: '#fff' };

    const { action, currentValue, path = [], result = [], successorValue } = step;

    if (value === currentValue) {
        if (action === 'insert')               return { fill: '#10b981', stroke: '#059669', text: '#fff' };
        if (action === 'found')                return { fill: '#10b981', stroke: '#059669', text: '#fff' };
        if (action === 'not_found')            return { fill: '#ef4444', stroke: '#dc2626', text: '#fff' };
        if (action === 'delete_leaf')          return { fill: '#ef4444', stroke: '#dc2626', text: '#fff' };
        if (action === 'delete_one_child')     return { fill: '#ef4444', stroke: '#dc2626', text: '#fff' };
        if (action === 'find_successor')       return { fill: '#ef4444', stroke: '#dc2626', text: '#fff' };
        if (action === 'replace_with_successor') return { fill: '#a855f7', stroke: '#9333ea', text: '#fff' };
        if (action === 'traverse_visit')       return { fill: '#f59e0b', stroke: '#d97706', text: '#fff' };
        if (action === 'duplicate')            return { fill: '#f59e0b', stroke: '#d97706', text: '#fff' };
        return { fill: '#f59e0b', stroke: '#d97706', text: '#fff' };
    }

    // Successor highlight
    if (value === successorValue && action === 'find_successor') {
        return { fill: '#a855f7', stroke: '#9333ea', text: '#fff' };
    }

    // Already-visited nodes during traversal
    if (action === 'traverse_visit' && result.includes(value)) {
        return { fill: '#d1fae5', stroke: '#6ee7b7', text: '#065f46' };
    }
    if (action === 'traverse_done' && result.includes(value)) {
        return { fill: '#d1fae5', stroke: '#6ee7b7', text: '#065f46' };
    }

    // Path (traversal from root to current)
    if (path.includes(value)) {
        return { fill: '#dbeafe', stroke: '#93c5fd', text: '#1e40af' };
    }

    return { fill: '#3b82f6', stroke: '#2563eb', text: '#fff' };
}

// ── Component ─────────────────────────────────────────────────────────────────
const TreeCanvas = ({ tree, step, width }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        if (!svgRef.current || !width) return;

        const displayTree = step?.treeAfter ?? tree;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        if (!displayTree) {
            const h = 220;
            svg.attr('height', h);
            svg.append('text')
                .attr('x', width / 2).attr('y', h / 2 - 10)
                .attr('text-anchor', 'middle')
                .attr('font-size', '14px')
                .attr('font-family', 'Inter, sans-serif')
                .attr('fill', '#9ca3af')
                .text('Tree is empty.');
            svg.append('text')
                .attr('x', width / 2).attr('y', h / 2 + 14)
                .attr('text-anchor', 'middle')
                .attr('font-size', '13px')
                .attr('font-family', 'Inter, sans-serif')
                .attr('fill', '#c0c9d8')
                .text('Insert a node or generate a random tree to begin.');
            return;
        }

        const { nodes, edges, svgHeight } = layoutTree(displayTree, width);
        svg.attr('height', svgHeight);

        const path = step?.path ?? [];

        // ── Edges
        edges.forEach(({ from, to, x1, y1, x2, y2 }) => {
            const inPath = path.includes(from) && path.includes(to);
            svg.append('line')
                .attr('x1', x1).attr('y1', y1)
                .attr('x2', x2).attr('y2', y2)
                .attr('stroke',       inPath ? '#3b82f6' : '#e2e8f0')
                .attr('stroke-width', inPath ? 2 : 1.5)
                .attr('stroke-linecap', 'round');
        });

        // ── Nodes
        nodes.forEach(({ value, px, py }) => {
            const style = nodeStyle(value, step);
            const g = svg.append('g').attr('transform', `translate(${px},${py})`);

            g.append('circle')
                .attr('r',            NODE_R)
                .attr('fill',         style.fill)
                .attr('stroke',       style.stroke)
                .attr('stroke-width', 2);

            g.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy',          '0.35em')
                .attr('font-size',   value > 99 ? '10px' : '13px')
                .attr('font-weight', '700')
                .attr('font-family', 'Inter, sans-serif')
                .attr('fill',        style.text)
                .text(value);
        });

    }, [tree, step, width]);

    return (
        <div className="tree-canvas-wrap">
            <svg
                ref={svgRef}
                width={width}
                className="tree-svg"
            />
        </div>
    );
};

export default TreeCanvas;
