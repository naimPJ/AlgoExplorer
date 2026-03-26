import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

// Segment background colours
const SEG = {
    inactive:       { fill: '#f8fafc', stroke: '#e5e9f2', strokeWidth: 1 },
    left:           { fill: '#dbeafe', stroke: '#93c5fd', strokeWidth: 1.5 },
    right:          { fill: '#fef3c7', stroke: '#fcd34d', strokeWidth: 1.5 },
    mergeComplete:  { fill: '#d1fae5', stroke: '#6ee7b7', strokeWidth: 1.5 },
};

// Bar colours
const BAR = {
    default:        '#3b82f6',
    leftGroup:      '#60a5fa',
    rightGroup:     '#fbbf24',
    compare:        '#f59e0b',
    write:          '#f97316',
    merged:         '#10b981',
};

const MergeCanvas = ({ step, dimensions }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        if (!svgRef.current || !step || !dimensions.width || !dimensions.height) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const { array, segments, indices, action, leftRange, rightRange, activeRange } = step;
        if (!array || array.length === 0) return;

        const margin = { top: 28, right: 24, bottom: 56, left: 36 };
        const W = dimensions.width  - margin.left - margin.right;
        const H = dimensions.height - margin.top  - margin.bottom;

        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        const n = array.length;

        const xScale = d3.scaleBand()
            .domain(d3.range(n))
            .range([0, W])
            .padding(0.18);

        const yScale = d3.scaleLinear()
            .domain([0, Math.max(...array) * 1.15])
            .range([H, 0]);

        // ── Segment backgrounds ───────────────────────────────────────────
        (segments || []).forEach(([start, end]) => {
            const isLeft  = leftRange  && start === leftRange[0]  && end === leftRange[1];
            const isRight = rightRange && start === rightRange[0] && end === rightRange[1];
            const isDone  = action === 'merge_complete' && activeRange
                && start === activeRange[0] && end === activeRange[1];

            const style = isDone ? SEG.mergeComplete
                        : isLeft  ? SEG.left
                        : isRight ? SEG.right
                        : SEG.inactive;

            const x1 = xScale(start);
            const x2 = xScale(end - 1) + xScale.bandwidth();

            g.append("rect")
                .attr("x",      x1 - 5)
                .attr("y",      -10)
                .attr("width",  x2 - x1 + 10)
                .attr("height", H + 20)
                .attr("fill",   style.fill)
                .attr("stroke", style.stroke)
                .attr("stroke-width", style.strokeWidth)
                .attr("rx", 8);

            // Range label under the group
            const labelColor = (isLeft || isRight || isDone) ? '#6b7280' : '#c8d0dd';
            g.append("text")
                .attr("x",           (x1 + x2) / 2)
                .attr("y",           H + 42)
                .attr("text-anchor", "middle")
                .attr("font-size",   "10px")
                .attr("font-family", "Inter, sans-serif")
                .attr("fill",        labelColor)
                .text(end - start === 1 ? `[${start}]` : `[${start}–${end - 1}]`);
        });

        // ── Bars ──────────────────────────────────────────────────────────
        array.forEach((value, i) => {
            const isActive = indices && indices.includes(i);
            const inLeft   = leftRange  && i >= leftRange[0]  && i < leftRange[1];
            const inRight  = rightRange && i >= rightRange[0] && i < rightRange[1];

            let fill = BAR.default;

            if (action === 'merge_complete') {
                const inActive = activeRange && i >= activeRange[0] && i < activeRange[1];
                fill = inActive ? BAR.merged : BAR.default;
            } else if (isActive) {
                fill = action === 'write' ? BAR.write : BAR.compare;
            } else if (inLeft) {
                fill = BAR.leftGroup;
            } else if (inRight) {
                fill = BAR.rightGroup;
            }

            g.append("rect")
                .attr("x",      xScale(i))
                .attr("y",      yScale(value))
                .attr("width",  xScale.bandwidth())
                .attr("height", H - yScale(value))
                .attr("fill",   fill)
                .attr("rx",     3);

            // Value label above bar (skip if bars are too narrow)
            if (xScale.bandwidth() > 18) {
                g.append("text")
                    .attr("x",           xScale(i) + xScale.bandwidth() / 2)
                    .attr("y",           yScale(value) - 5)
                    .attr("text-anchor", "middle")
                    .attr("font-size",   "11px")
                    .attr("font-family", "Inter, sans-serif")
                    .attr("fill",        "#6b7280")
                    .text(value);
            }
        });

        // ── Y axis ────────────────────────────────────────────────────────
        g.append("g")
            .call(d3.axisLeft(yScale).ticks(4).tickSize(-W))
            .call(ax => ax.select(".domain").remove())
            .call(ax => ax.selectAll(".tick line")
                .attr("stroke", "#f0f2f7")
                .attr("stroke-dasharray", "3,3"))
            .call(ax => ax.selectAll(".tick text")
                .attr("fill", "#9ca3af")
                .attr("font-size", "10px")
                .attr("font-family", "Inter, sans-serif")
                .attr("dx", "-4px"));

        // ── Legend ────────────────────────────────────────────────────────
        const legendItems = [
            { color: SEG.left.fill,         border: SEG.left.stroke,         label: 'Left sub-array'  },
            { color: SEG.right.fill,         border: SEG.right.stroke,        label: 'Right sub-array' },
            { color: SEG.mergeComplete.fill, border: SEG.mergeComplete.stroke, label: 'Merged'          },
        ];

        const legend = svg.append("g")
            .attr("transform", `translate(${margin.left}, ${dimensions.height - 14})`);

        legendItems.forEach((item, idx) => {
            const x = idx * 130;
            legend.append("rect")
                .attr("x", x).attr("y", 0)
                .attr("width", 10).attr("height", 10)
                .attr("fill", item.color)
                .attr("stroke", item.border)
                .attr("stroke-width", 1)
                .attr("rx", 2);
            legend.append("text")
                .attr("x", x + 14).attr("y", 9)
                .attr("font-size", "10px")
                .attr("font-family", "Inter, sans-serif")
                .attr("fill", "#9ca3af")
                .text(item.label);
        });

    }, [step, dimensions]);

    return (
        <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="visualization-canvas"
        />
    );
};

export default MergeCanvas;
