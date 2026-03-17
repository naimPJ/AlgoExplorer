// components/Navbar.js
import React from "react";
import "./Navbar.css"; // Optional: CSS file for styling
import logo from "../assets/logo.png"

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="logo">
                <img src={logo} alt="Logo" className="logo-image" />
            </div>
            <div className="nav-links">
                <button className="nav-button">DOCS</button>
                <button className="nav-button">ABOUT</button>
                <button className="nav-button">CONTACT</button>
            </div>
        </nav>
    );
};

export default Navbar;
