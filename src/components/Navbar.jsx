import React from "react";
import "./Navbar.css";
import logo from "../assets/logo.png";

const Navbar = ({ view, algorithmName, onHome }) => {
    const inViz = view === "visualization";

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <div
                    className={`logo${inViz ? " logo--link" : ""}`}
                    onClick={inViz ? onHome : undefined}
                    role={inViz ? "button" : undefined}
                    tabIndex={inViz ? 0 : undefined}
                    onKeyDown={inViz ? (e) => e.key === "Enter" && onHome() : undefined}
                    aria-label={inViz ? "Back to all algorithms" : undefined}
                >
                    <img src={logo} alt="Logo" className="logo-image" />
                </div>

                {inViz && (
                    <>
                        <span className="navbar-sep" aria-hidden="true">›</span>
                        <span className="navbar-algo-name">{algorithmName}</span>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
