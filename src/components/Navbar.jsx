import React from "react";
import "./Navbar.css";
import logo from "../assets/logo.png";
import { useAuth } from "../context/useAuth";

const Navbar = ({ view, algorithmName, onHome, onOpenAuth }) => {
    const { user, logout } = useAuth();
    const inViz  = view === "visualization";
    const inTree = view === "tree";
    const inRace = view === "race";
    const inSub  = inViz || inTree || inRace;

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
                            {inTree ? "Binary Search Tree" : inRace ? "Race Mode" : algorithmName}
                        </span>
                    </>
                )}
            </div>

            <div className="navbar-right">
                {user ? (
                    <>
                        <span className="navbar-username">{user.username}</span>
                        <button className="navbar-btn navbar-btn--ghost" onClick={logout}>
                            Sign out
                        </button>
                    </>
                ) : (
                    <button className="navbar-btn navbar-btn--primary" onClick={onOpenAuth}>
                        Sign in
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
