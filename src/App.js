// App.js
import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import VisualizationCanvas from "./components/VisualizationCanvas";
import "./App.css";

const App = () => {
    const [selectedAlgorithm, setSelectedAlgorithm] = useState("bubbleSort");
    const [array, setArray] = useState([]);
    const [isAlgorithmRunning, setIsAlgorithmRunning] = useState(false);

    const handleAlgorithmSelect = (algorithm) => {
        setSelectedAlgorithm(algorithm);
    };

    const handleArrayInput = (input) => {
        const array = input.split(",").map(Number).filter((num) => !isNaN(num));
        setArray(array);
    };

    const handleStartAlgorithm = () => {
        if (array.length === 0) {
            alert("Please enter a valid array before starting the algorithm.");
            return;
        }
        setIsAlgorithmRunning(true);
        console.log(`Starting ${selectedAlgorithm} with array:`, array);
        setIsAlgorithmRunning(false);
    };

    return (
        <div className="App">
            <Navbar />
            <main>
                <div className="main-content">
                    <Sidebar 
                        onAlgorithmSelect={handleAlgorithmSelect}
                        selectedAlgorithm={selectedAlgorithm}
                    />
                    <div className="content-container">
                        <div className="algorithm-header">
                            <h1>{selectedAlgorithm} Visualization</h1>
                            <div className="array-input-container">
                                <input
                                    type="text"
                                    placeholder="Enter numbers separated by commas"
                                    onBlur={(e) => handleArrayInput(e.target.value)}
                                    className="array-input"
                                />
                                <button
                                    onClick={handleStartAlgorithm}
                                    className="start-button"
                                    disabled={isAlgorithmRunning}
                                >
                                    Start
                                </button>
                            </div>
                        </div>
                        <VisualizationCanvas 
                            array={array} 
                            algorithm={selectedAlgorithm}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
