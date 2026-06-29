import React from "react";
import "./PseudocodePanel.css";

const PseudocodePanel = ({ pseudocode, activeLine }) => {
    if (!pseudocode?.length) return null;

    return (
        <div className="pseudocode-panel">
            <div className="pseudocode-header">Pseudocode</div>
            <pre className="pseudocode-body">
                {pseudocode.map((line, i) => (
                    <span
                        key={i}
                        className={`pseudocode-line${i === activeLine ? " pseudocode-line--active" : ""}`}
                    >
                        {line}
                    </span>
                ))}
            </pre>
        </div>
    );
};

export default PseudocodePanel;
