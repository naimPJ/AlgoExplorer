import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const COLORS = {
    cell:        { fill: '#f8fafc', stroke: '#e2e8f0', text: '#374151' },
    active:      { fill: '#dbeafe', stroke: '#3b82f6', text: '#1d4ed8' },
    bucket:      { fill: '#fef3c7', stroke: '#f59e0b', text: '#92400e' },
    placed:      { fill: '#d1fae5', stroke: '#10b981', text: '#065f46' },
    empty:       { fill: '#f9fafb', stroke: '#e2e8f0', text: '#d1d5db' },
    prefixActive:{ fill: '#ede9fe', stroke: '#7c3aed', text: '#4c1d95' },
};

const LABEL_STYLE = { fill: '#9ca3af', fontSize: '10px', fontFamily: 'Inter, sans-serif' };
const CELL_H = 38;
const CELL_R = 6;

function drawRow(g, values, xScale, y, getStyle, getLabel) {
    values.forEach((val, i) => {
        const x  = xScale(i);
        const bw = xScale.bandwidth();
        const s  = getStyle(val, i);

        g.append("rect")
            .attr("x", x).attr("y", y)
            .attr("width", bw).attr("height", CELL_H)
            .attr("fill", s.fill).attr("stroke", s.stroke)
            .attr("stroke-width", s.stroke === COLORS.cell.stroke ? 1 : 2)
            .attr("rx", CELL_R);

        const displayText = val === null || val === undefined ? '·' : String(val);
        g.append("text")
            .attr("x", x + bw / 2).attr("y", y + CELL_H / 2 + 5)
            .attr("text-anchor", "middle")
            .attr("font-size", bw > 30 ? "14px" : "11px")
            .attr("font-weight", "700")
            .attr("font-family", "Inter, sans-serif")
            .attr("fill", s.text)
            .text(displayText);

        if (getLabel) {
            g.append("text")
                .attr("x", x + bw / 2).attr("y", y + CELL_H + 13)
                .attr("text-anchor", "middle")
                .attr("font-size", "10px")
                .attr("font-family", "Inter, sans-serif")
                .attr("fill", "#9ca3af")
                .text(getLabel(i));
        }
    });
}

function sectionLabel(svg, x, y, text) {
    svg.append("text")
        .attr("x", x).attr("y", y + CELL_H / 2 + 5)
        .attr("text-anchor", "end")
        .attr("font-size", "10px")
        .attr("font-weight", "600")
        .attr("font-family", "Inter, sans-serif")
        .attr("fill", "#9ca3af")
        .text(text);
}

const CountingCanvas = ({ step, dimensions }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        if (!svgRef.current || !step || !dimensions.width || !dimensions.height) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const { array, bins, binKeys, activeBin, output, indices, iteration: phase, outputActive } = step;
        if (!array || !bins) return;

        const W       = dimensions.width;
        const H       = dimensions.height;
        const ML      = 72;
        const MR      = 50;
        const MT      = 28;
        const MB      = 16;
        const innerW  = W - ML - MR;
        const n       = array.length;
        const nbins   = bins.length;
        const showOut = phase === 2 && Array.isArray(output);

        // ── Phase label ───────────────────────────────────────────────────────
        const phaseLabels = {
            1: 'Phase 1 — Counting',
            2: 'Phase 2 — Placing elements',
        };
        svg.append("text")
            .attr("x", W - MR).attr("y", 15)
            .attr("text-anchor", "end")
            .attr("font-size", "11px")
            .attr("font-weight", "600")
            .attr("font-family", "Inter, sans-serif")
            .attr("fill", phase === 1 ? '#f59e0b' : '#10b981')
            .text(phaseLabels[phase] ?? '');

        // ── Row Y positions — center the block vertically ─────────────────────
        const LABEL_H  = 16;
        const ROW_UNIT = CELL_H + LABEL_H;   // 54px per row slot
        const GAP      = 28;                  // fixed gap between rows
        const numRows  = showOut ? 3 : 2;
        const blockH   = numRows * ROW_UNIT + (numRows - 1) * GAP;
        const startY   = Math.max(MT, (H - blockH) / 2);

        const arrayY  = startY;
        const binsY   = startY + ROW_UNIT + GAP;
        const outputY = startY + 2 * (ROW_UNIT + GAP);

        // ── Input array ───────────────────────────────────────────────────────
        const xArr = d3.scaleBand()
            .domain(d3.range(n))
            .range([0, innerW])
            .padding(0.15);

        const arrG = svg.append("g").attr("transform", `translate(${ML},0)`);

        drawRow(arrG, array, xArr, arrayY,
            (val, i) => {
                if (indices && indices.includes(i)) return COLORS.active;
                return COLORS.cell;
            },
            null
        );

        // index labels below input cells
        array.forEach((_, i) => {
            arrG.append("text")
                .attr("x", xArr(i) + xArr.bandwidth() / 2)
                .attr("y", arrayY + CELL_H + LABEL_H)
                .attr("text-anchor", "middle")
                .attr("font-size", "10px")
                .attr("font-family", "Inter, sans-serif")
                .attr("fill", "#c0c9d8")
                .text(i);
        });

        sectionLabel(svg, ML - 8, arrayY, "Array");

        // ── Count / prefix-sum bins ───────────────────────────────────────────
        const xBins = d3.scaleBand()
            .domain(d3.range(nbins))
            .range([0, innerW])
            .padding(0.12);

        const binsG = svg.append("g").attr("transform", `translate(${ML},0)`);

        drawRow(binsG, bins, xBins, binsY,
            (val, i) => {
                if (i === activeBin) {
                    return phase === 2 ? COLORS.prefixActive : COLORS.bucket;
                }
                if (val === 0) return COLORS.empty;
                return COLORS.cell;
            },
            i => binKeys ? binKeys[i] : i
        );

        sectionLabel(svg, ML - 8, binsY, "Count");

        // ── Output array (phase 3 only) ───────────────────────────────────────
        if (showOut) {
            const outG = svg.append("g").attr("transform", `translate(${ML},0)`);

            drawRow(outG, output, xArr, outputY,
                (val, i) => {
                    if (val === null || val === undefined) return COLORS.empty;
                    if (i === outputActive) return COLORS.placed;
                    return { fill: '#d1fae5', stroke: '#6ee7b7', text: '#065f46' };
                },
                null
            );

            // index labels below output cells
            output.forEach((_, i) => {
                outG.append("text")
                    .attr("x", xArr(i) + xArr.bandwidth() / 2)
                    .attr("y", outputY + CELL_H + LABEL_H)
                    .attr("text-anchor", "middle")
                    .attr("font-size", "10px")
                    .attr("font-family", "Inter, sans-serif")
                    .attr("fill", "#c0c9d8")
                    .text(i);
            });

            sectionLabel(svg, ML - 8, outputY, "Output");
        }

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

export default CountingCanvas;
