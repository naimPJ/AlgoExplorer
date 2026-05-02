import React, { createContext, useState } from "react";

export const AuthContext = createContext(null);

const API = "http://localhost:3001/api/auth";

const getToken  = () => localStorage.getItem("ae_token");
const saveToken = (t) => localStorage.setItem("ae_token", t);
const clearToken = () => localStorage.removeItem("ae_token");

const getSession  = () => JSON.parse(localStorage.getItem("ae_session") || "null");
const saveSession = (u) => localStorage.setItem("ae_session", JSON.stringify(u));
const clearSession = () => localStorage.removeItem("ae_session");

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => getSession());

    const login = async (email, password) => {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) return data.error || "Login failed.";
        saveToken(data.token);
        saveSession(data.user);
        setUser(data.user);
        return null;
    };

    const register = async (username, email, password, college) => {
        const res = await fetch(`${API}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, college }),
        });
        const data = await res.json();
        if (!res.ok) return data.error || "Registration failed.";
        saveToken(data.token);
        saveSession(data.user);
        setUser(data.user);
        return null;
    };

    const loginWithToken = (token, userData) => {
        saveToken(token);
        saveSession(userData);
        setUser(userData);
    };

    const logout = () => {
        clearToken();
        clearSession();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, getToken, loginWithToken }}>
            {children}
        </AuthContext.Provider>
    );
};

