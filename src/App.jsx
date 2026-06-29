import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import VisualizationCanvas from "./components/VisualizationCanvas";
import TreePage from "./pages/TreePage";
import AuthPage from "./pages/AuthPage";
import RacePage from "./pages/RacePage";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import "./App.css";

const AppInner = () => {
    const { loginWithToken } = useAuth();
    const [view, setView] = useState("landing");

    useEffect(() => {
        if (window.location.pathname === "/auth/callback") {
            const params = new URLSearchParams(window.location.search);
            const token  = params.get("token");
            const user   = params.get("user");
            if (token && user) {
                loginWithToken(token, JSON.parse(user));
            }
            window.history.replaceState({}, "", "/");
        }
    }, []);
    const [selectedAlgorithm, setSelectedAlgorithm] = useState("bubbleSort");
    const [array, setArray] = useState([]);
    const [randomCount, setRandomCount] = useState(10);

    const handleSelectAlgorithm = (id) => {
        setSelectedAlgorithm(id);
        setArray([]);
        setView("visualization");
    };

    const handleOpenTree = () => setView("tree");
    const handleOpenRace = () => setView("race");

    const handleBack = () => {
        setView("landing");
        setArray([]);
    };

    const inSub = ["visualization", "tree", "race"].includes(view);

    const handleOpenAuth = () => setView("auth");
    const handleAuthSuccess = () => setView("landing");

    const handleArrayInput = (input) => {
        const parsed = input.split(",").map(Number).filter((n) => !isNaN(n));
        setArray(parsed);
    };

    const handleRandom = () => {
        const count = Math.min(Math.max(randomCount, 2), 30);
        const generated = Array.from({ length: count }, () => Math.floor(Math.random() * 99) + 1);
        setArray(generated);
    };

    const algorithmName = view === "race"
        ? "Race Mode"
        : selectedAlgorithm
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, s => s.toUpperCase())
            .trim();

    return (
        <div className="App">
            <Navbar view={view} algorithmName={algorithmName} onHome={handleBack} onOpenAuth={handleOpenAuth} inSub={inSub} />
            <main>
                {view === "auth" ? (
                    <AuthPage onSuccess={handleAuthSuccess} onBack={handleBack} />
                ) : view === "landing" ? (
                    <LandingPage onSelect={handleSelectAlgorithm} onOpenTree={handleOpenTree} onOpenAuth={handleOpenAuth} onOpenRace={handleOpenRace} />
                ) : view === "tree" ? (
                    <TreePage />
                ) : view === "race" ? (
                    <RacePage onBack={handleBack} />
                ) : (
                    <div className="viz-view">
                        <div className="array-input-bar">
                            <input
                                type="text"
                                placeholder="Enter numbers separated by commas, e.g. 5, 3, 8, 1, 9"
                                onBlur={(e) => handleArrayInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleArrayInput(e.target.value)}
                                className="array-input"
                                key={selectedAlgorithm}
                            />
                            <div className="array-input-divider" />
                            <div className="array-random-group">
                                <label className="array-random-label">Elements</label>
                                <input
                                    type="number"
                                    className="array-count-input"
                                    value={randomCount}
                                    min={2}
                                    max={30}
                                    onChange={(e) => setRandomCount(Number(e.target.value))}
                                />
                                <button className="array-random-btn" onClick={handleRandom}>
                                    Random
                                </button>
                            </div>
                        </div>

                        <VisualizationCanvas
                            array={array}
                            algorithm={selectedAlgorithm}
                            onOpenAuth={handleOpenAuth}
                        />
                    </div>
                )}
            </main>
        </div>
    );
};

const App = () => (
    <AuthProvider>
        <AppInner />
    </AuthProvider>
);

export default App;
