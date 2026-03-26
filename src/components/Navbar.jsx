import React from "react";
import "./Navbar.css";
import logo from "../assets/logo.png";

const Navbar = ({ view, algorithmName, onHome }) => {
    const inViz  = view === "visualization";
    const inTree = view === "tree";
    const inSub  = inViz || inTree;

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <div
                    className={`logo${inSub ? " logo--link" : ""}`}
                    onClick={inSub ? onHome : undefined}
                    role={inSub ? "button" : undefined}
                    tabIndex={inSub ? 0 : undefined}
                    onKeyDown={inSub ? (e) => e.key === "Enter" && onHome() : undefined}
                    aria-label={inSub ? "Back to home" : undefined}
                >
                    <img src={logo} alt="Logo" className="logo-image" />
                </div>

                {inSub && (
                    <>
                        <span className="navbar-sep" aria-hidden="true">›</span>
                        <span className="navbar-algo-name">
                            {inTree ? "Binary Search Tree" : algorithmName}
                        </span>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
