import React, { useState } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import VisualizationCanvas from "./components/VisualizationCanvas";
import TreePage from "./pages/TreePage";
import "./App.css";

const App = () => {
    const [view, setView] = useState("landing");
    const [selectedAlgorithm, setSelectedAlgorithm] = useState("bubbleSort");
    const [array, setArray] = useState([]);

    const handleSelectAlgorithm = (id) => {
        setSelectedAlgorithm(id);
        setArray([]);
        setView("visualization");
    };

    const handleOpenTree = () => setView("tree");

    const handleBack = () => {
        setView("landing");
        setArray([]);
    };

    const handleArrayInput = (input) => {
        const parsed = input.split(",").map(Number).filter((n) => !isNaN(n));
        setArray(parsed);
    };

    const algorithmName = selectedAlgorithm
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, s => s.toUpperCase())
        .trim();

    return (
        <div className="App">
            <Navbar view={view} algorithmName={algorithmName} onHome={handleBack} />
            <main>
                {view === "landing" ? (
                    <LandingPage onSelect={handleSelectAlgorithm} onOpenTree={handleOpenTree} />
                ) : view === "tree" ? (
                    <TreePage />
                ) : (
                    <div className="viz-view">
                        <div className="array-input-bar">
                            <input
                                type="text"
                                placeholder="Enter numbers separated by commas, e.g. 5, 3, 8, 1, 9"
                                onBlur={(e) => handleArrayInput(e.target.value)}
                                className="array-input"
                                key={selectedAlgorithm}
                            />
                        </div>

                        <VisualizationCanvas
                            array={array}
                            algorithm={selectedAlgorithm}
                        />
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
