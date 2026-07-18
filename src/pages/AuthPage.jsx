import React, { useState } from "react";
import { useAuth } from "../context/useAuth";
import { API_BASE_URL } from "../config";
import "./AuthPage.css";

const AuthPage = ({ onSuccess, onBack }) => {
    const { login, register } = useAuth();
    const [mode, setMode]       = useState("login"); // "login" | "register"
    const [error, setError]     = useState("");
    const [loading, setLoading] = useState(false);

    const [fields, setFields] = useState({
        username: "", email: "", password: "", confirm: "", college: "",
    });

    const set = (key) => (e) => {
        setError("");
        setFields(prev => ({ ...prev, [key]: e.target.value }));
    };

    const switchMode = (m) => {
        setMode(m);
        setError("");
        setFields({ username: "", email: "", password: "", confirm: "", college: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (mode === "login") {
            if (!fields.email || !fields.password) {
                setError("Please fill in all fields.");
                return;
            }
            setLoading(true);
            const err = await login(fields.email, fields.password);
            setLoading(false);
            if (err) { setError(err); return; }
            onSuccess();
        } else {
            if (!fields.username || !fields.email || !fields.password || !fields.confirm || !fields.college) {
                setError("Please fill in all fields.");
                return;
            }
            if (fields.password !== fields.confirm) {
                setError("Passwords do not match.");
                return;
            }
            if (fields.password.length < 6) {
                setError("Password must be at least 6 characters.");
                return;
            }
            setLoading(true);
            const err = await register(fields.username, fields.email, fields.password, fields.college);
            setLoading(false);
            if (err) { setError(err); return; }
            onSuccess();
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                {/* Tab toggle */}
                <div className="auth-tabs">
                    <button
                        className={`auth-tab${mode === "login" ? " auth-tab--active" : ""}`}
                        onClick={() => switchMode("login")}
                        type="button"
                    >
                        Sign in
                    </button>
                    <button
                        className={`auth-tab${mode === "register" ? " auth-tab--active" : ""}`}
                        onClick={() => switchMode("register")}
                        type="button"
                    >
                        Create account
                    </button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>

                    {mode === "register" && (
                        <>
                            <div className="auth-field">
                                <label className="auth-label">Username</label>
                                <input
                                    className="auth-input"
                                    type="text"
                                    placeholder="e.g. johndoe"
                                    value={fields.username}
                                    onChange={set("username")}
                                    autoComplete="username"
                                />
                            </div>
                            <div className="auth-field">
                                <label className="auth-label">College / University</label>
                                <input
                                    className="auth-input"
                                    type="text"
                                    placeholder="e.g. International Burch University"
                                    value={fields.college}
                                    onChange={set("college")}
                                    autoComplete="organization"
                                />
                            </div>
                        </>
                    )}

                    <div className="auth-field">
                        <label className="auth-label">Email</label>
                        <input
                            className="auth-input"
                            type="email"
                            placeholder="you@example.com"
                            value={fields.email}
                            onChange={set("email")}
                            autoComplete="email"
                        />
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">Password</label>
                        <input
                            className="auth-input"
                            type="password"
                            placeholder="••••••••"
                            value={fields.password}
                            onChange={set("password")}
                            autoComplete={mode === "login" ? "current-password" : "new-password"}
                        />
                    </div>

                    {mode === "register" && (
                        <div className="auth-field">
                            <label className="auth-label">Confirm password</label>
                            <input
                                className="auth-input"
                                type="password"
                                placeholder="••••••••"
                                value={fields.confirm}
                                onChange={set("confirm")}
                                autoComplete="new-password"
                            />
                        </div>
                    )}

                    {error && <p className="auth-error">{error}</p>}

                    <button className="auth-submit" type="submit" disabled={loading}>
                        {mode === "login" ? "Sign in" : "Create account"}
                    </button>
                </form>

                <div className="auth-divider"><span>or</span></div>

                <a
                    className="auth-google"
                    href={`${API_BASE_URL}/api/auth/google`}
                >
                    <svg viewBox="0 0 48 48" width="18" height="18">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    Continue with Google
                </a>

                <button className="auth-back" onClick={onBack} type="button">
                    Back to home
                </button>
            </div>
        </div>
    );
};

export default AuthPage;
