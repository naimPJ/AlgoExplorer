import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const PHASE = {
    1: { bar: '#f59e0b', bin: '#f59e0b', binBg: '#fef3c7', binFill: '#fcd34d', label: 'Phase 1 — Count occurrences' },
    2: { bar: '#8b5cf6', bin: '#8b5cf6', binBg: '#ede9fe', binFill: '#a78bfa', label: 'Phase 2 — Prefix sums' },
    3: { bar: '#f97316', bin: '#f97316', binBg: '#ffedd5', binFill: '#fb923c', label: 'Phase 3 — Place elements' },
};

const ML = 44;
const MR = 16;
const GAP = 10;

const CountingCanvas = ({ step, dimensions }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        if (!svgRef.current || !step || !dimensions.width || !dimensions.height) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const { array, bins, binMin, activeBin, output, indices, iteration: phase, outputActive } = step;
        if (!array || !bins) return;

        const W = dimensions.width;
        const H = dimensions.height;
        const innerW = W - ML - MR;
        const colors = PHASE[phase] ?? PHASE[1];
        const hasOutput = phase === 3 && Array.isArray(output);

        // ── Heights per phase ─────────────────────────────────────────────────
        const arrayH  = hasOutput ? Math.floor(H * 0.36) : Math.floor(H * 0.43);
        const binsH   = hasOutput ? Math.floor(H * 0.33) : Math.floor(H * 0.50);
        const outputH = hasOutput ? H - arrayH - binsH - GAP * 2 : 0;
        const binsY   = arrayH + GAP;
        const outputY = binsY + binsH + GAP;

        // ── X scale (shared by input and output panels) ───────────────────────
        const n = array.length;
        const xScale = d3.scaleBand()
            .domain(d3.range(n))
            .range([0, innerW])
            .padding(0.2);

        const maxVal = Math.max(...array) * 1.2;

        // ── Phase label ───────────────────────────────────────────────────────
        svg.append("text")
            .attr("x", W - MR)
            .attr("y", 13)
            .attr("text-anchor", "end")
            .attr("font-size", "11px")
            .attr("font-weight", "600")
            .attr("font-family", "Inter, sans-serif")
            .attr("fill", colors.bin)
            .text(colors.label);

        // ── Input array panel ─────────────────────────────────────────────────
        const yArr = d3.scaleLinear().domain([0, maxVal]).range([arrayH - 22, 0]);
        const arrG = svg.append("g").attr("transform", `translate(${ML},0)`);

        arrG.append("g")
            .call(d3.axisLeft(yArr).ticks(4).tickSize(-innerW))
            .call(ax => ax.select(".domain").remove())
            .call(ax => ax.selectAll(".tick line").attr("stroke", "#f0f2f7").attr("stroke-dasharray", "2,2"))
            .call(ax => ax.selectAll(".tick text")
                .attr("fill", "#9ca3af").attr("font-size", "9px").attr("font-family", "Inter, sans-serif"));

        array.forEach((val, i) => {
            const isActive = indices && indices.includes(i);
            arrG.append("rect")
                .attr("x", xScale(i)).attr("y", yArr(val))
                .attr("width", xScale.bandwidth()).attr("height", arrayH - 22 - yArr(val))
                .attr("fill", isActive ? colors.bar : '#3b82f6')
                .attr("rx", 3);
            if (xScale.bandwidth() > 14) {
                arrG.append("text")
                    .attr("x", xScale(i) + xScale.bandwidth() / 2).attr("y", yArr(val) - 3)
                    .attr("text-anchor", "middle")
                    .attr("font-size", "10px").attr("font-family", "Inter, sans-serif")
                    .attr("fill", "#9ca3af")
                    .text(val);
            }
        });

        svg.append("text")
            .attr("transform", `translate(11,${arrayH / 2}) rotate(-90)`)
            .attr("text-anchor", "middle").attr("font-size", "9px")
            .attr("font-family", "Inter, sans-serif").attr("fill", "#c0c9d8")
            .text("INPUT");

        // ── Bins panel ────────────────────────────────────────────────────────
        const numBins   = bins.length;
        const binGap    = 5;
        const binW      = Math.min(58, Math.floor((innerW - (numBins - 1) * binGap) / numBins));
        const totalBinsW = numBins * binW + (numBins - 1) * binGap;
        const binsOffsetX = ML + Math.max(0, (innerW - totalBinsW) / 2);
        const BIN_INNER_H = binsH - 26;
        const maxBinVal   = Math.max(...bins, 1);

        const binsG = svg.append("g").attr("transform", `translate(${binsOffsetX},${binsY})`);

        bins.forEach((count, i) => {
            const isActive = i === activeBin;
            const x = i * (binW + binGap);
            const fillH = count > 0
                ? Math.max(4, (count / maxBinVal) * (BIN_INNER_H - 6))
                : 0;

            // Box
            binsG.append("rect")
                .attr("x", x).attr("y", 0)
                .attr("width", binW).attr("height", BIN_INNER_H)
                .attr("fill", isActive ? colors.binBg : "#f8fafc")
                .attr("stroke", isActive ? colors.bin : "#e2e8f0")
                .attr("stroke-width", isActive ? 2 : 1)
                .attr("rx", 6);

            // Fill bar (grows from bottom)
            if (fillH > 0) {
                binsG.append("rect")
                    .attr("x", x + 3).attr("y", BIN_INNER_H - fillH - 2)
                    .attr("width", binW - 6).attr("height", fillH)
                    .attr("fill", isActive ? colors.bin : colors.binFill)
                    .attr("opacity", 0.6)
                    .attr("rx", 3);
            }

            // Count label
            binsG.append("text")
                .attr("x", x + binW / 2).attr("y", BIN_INNER_H / 2 + 5)
                .attr("text-anchor", "middle")
                .attr("font-size", binW > 36 ? "15px" : "11px")
                .attr("font-weight", "700")
                .attr("font-family", "Inter, sans-serif")
                .attr("fill", isActive ? colors.bin : (count === 0 ? "#d1d5db" : "#374151"))
                .text(count);

            // Value label below
            binsG.append("text")
                .attr("x", x + binW / 2).attr("y", BIN_INNER_H + 17)
                .attr("text-anchor", "middle")
                .attr("font-size", "11px")
                .attr("font-family", "Inter, sans-serif")
                .attr("fill", isActive ? colors.bin : "#9ca3af")
                .text(i + binMin);
        });

        svg.append("text")
            .attr("transform", `translate(11,${binsY + binsH / 2}) rotate(-90)`)
            .attr("text-anchor", "middle").attr("font-size", "9px")
            .attr("font-family", "Inter, sans-serif").attr("fill", "#c0c9d8")
            .text(phase === 2 ? "PREFIX" : "COUNT");

        // ── Output array panel (phase 3 only) ─────────────────────────────────
        if (hasOutput) {
            const outInnerH = outputH - 16;
            const yOut = d3.scaleLinear().domain([0, maxVal]).range([outInnerH, 0]);
            const outG = svg.append("g").attr("transform", `translate(${ML},${outputY})`);

            output.forEach((val, i) => {
                const isActiveOut = i === outputActive;
                const x = xScale(i);
                const bw = xScale.bandwidth();

                if (val !== null && val !== undefined) {
                    outG.append("rect")
                        .attr("x", x).attr("y", yOut(val))
                        .attr("width", bw).attr("height", outInnerH - yOut(val))
                        .attr("fill", isActiveOut ? '#10b981' : '#a7f3d0')
                        .attr("rx", 3);
                    if (bw > 14) {
                        outG.append("text")
                            .attr("x", x + bw / 2).attr("y", yOut(val) - 3)
                            .attr("text-anchor", "middle")
                            .attr("font-size", "10px").attr("font-family", "Inter, sans-serif")
                            .attr("fill", "#6b7280")
                            .text(val);
                    }
                } else {
                    outG.append("rect")
                        .attr("x", x).attr("y", 0)
                        .attr("width", bw).attr("height", outInnerH)
                        .attr("fill", "none")
                        .attr("stroke", "#e2e8f0")
                        .attr("stroke-dasharray", "3,2")
                        .attr("rx", 3);
                }
            });

            svg.append("text")
                .attr("transform", `translate(11,${outputY + outputH / 2}) rotate(-90)`)
                .attr("text-anchor", "middle").attr("font-size", "9px")
                .attr("font-family", "Inter, sans-serif").attr("fill", "#c0c9d8")
                .text("OUTPUT");
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
