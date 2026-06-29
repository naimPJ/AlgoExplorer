import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import "./AlgoChat.css";

const API = "http://localhost:3001/api/chat";

const ChatMessage = ({ msg }) => (
    <div className={`algochat-msg algochat-msg--${msg.role}`}>
        <span className="algochat-msg-bubble">{msg.content}</span>
    </div>
);

const AlgoChat = ({ context, isRunning, onOpenAuth }) => {
    const { user, getToken } = useAuth();
    const [isOpen,     setIsOpen]     = useState(false);
    const [messages,   setMessages]   = useState([]);
    const [input,      setInput]      = useState("");
    const [streaming,  setStreaming]  = useState(false);
    const [showToast,  setShowToast]  = useState(false);
    const [quizMode,   setQuizMode]   = useState(false);
    const bottomRef   = useRef(null);
    const inputRef    = useRef(null);
    const abortRef    = useRef(null);
    const hasToastedRef = useRef(false);

    useEffect(() => {
        if (isRunning && !hasToastedRef.current && !isOpen) {
            hasToastedRef.current = true;
            setShowToast(true);
            const t = setTimeout(() => setShowToast(false), 5000);
            return () => clearTimeout(t);
        }
    }, [isRunning]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    const send = async () => {
        const question = input.trim();
        if (!question || streaming) return;

        setInput("");
        const userMsg = { role: "user", content: question };
        setMessages(prev => [...prev, userMsg]);
        setStreaming(true);

        // placeholder for streaming assistant message
        const assistantIdx = messages.length + 1;
        setMessages(prev => [...prev, { role: "assistant", content: "" }]);

        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const res = await fetch(API, {
                method:  "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`,
                },
                signal:  controller.signal,
                body: JSON.stringify({
                    question,
                    context,
                    history: messages.filter(m => m.content),
                    quizMode,
                }),
            });

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop();

                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;
                    const payload = line.slice(6);
                    if (payload === "[DONE]") break;

                    try {
                        const { text, error } = JSON.parse(payload);
                        if (error) throw new Error(error);
                        if (text) {
                            setMessages(prev => {
                                const next = [...prev];
                                next[next.length - 1] = {
                                    role: "assistant",
                                    content: next[next.length - 1].content + text,
                                };
                                return next;
                            });
                        }
                    } catch {
                        // skip malformed chunks
                    }
                }
            }
        } catch (err) {
            if (err.name !== "AbortError") {
                setMessages(prev => {
                    const next = [...prev];
                    next[next.length - 1] = {
                        role: "assistant",
                        content: "Something went wrong. Please try again.",
                    };
                    return next;
                });
            }
        } finally {
            setStreaming(false);
            abortRef.current = null;
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <div className={`algochat-wrap ${isOpen ? "algochat-wrap--open" : ""}`}>
            {/* Nudge toast */}
            {showToast && !isOpen && (
                <div className="algochat-toast">
                    <span>Need help understanding this? Ask AI</span>
                    <div className="algochat-toast-actions">
                        <button className="algochat-toast-open" onClick={() => { setIsOpen(true); setShowToast(false); }}>
                            Open chat
                        </button>
                        <button className="algochat-toast-dismiss" onClick={() => setShowToast(false)}>
                            Got it
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle button */}
            <button
                className="algochat-toggle"
                onClick={() => setIsOpen(o => !o)}
                title={isOpen ? "Close chat" : "Ask about this algorithm"}
            >
                {isOpen ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                )}
                {!isOpen && <span className="algochat-toggle-label">Ask AI</span>}
            </button>

            {/* Panel */}
            <div className="algochat-panel">
                <div className="algochat-header">
                    <div className="algochat-header-title">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Algorithm Tutor
                    </div>
                    <div className="algochat-header-actions">
                        {user && (
                            <button
                                className={`algochat-quiz-toggle ${quizMode ? "algochat-quiz-toggle--active" : ""}`}
                                onClick={() => setQuizMode(q => !q)}
                                title={quizMode ? "Switch to free Q&A" : "Switch to quiz mode"}
                            >
                                {quizMode ? "Free Q&A" : "Quiz me"}
                            </button>
                        )}
                        <button className="algochat-header-close" onClick={() => setIsOpen(false)}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="algochat-messages">
                    {messages.length === 0 && (
                        <div className="algochat-empty">
                            <p>{quizMode ? "Quiz mode: the AI will ask you what happens next." : "Ask anything about what's happening in the current execution."}</p>
                            <div className="algochat-suggestions">
                                {(quizMode
                                    ? ["It will compare two elements", "It will swap two elements", "It will write a value"]
                                    : ["Why did it swap those elements?", "What's the current iteration doing?", "How close is it to sorted?"]
                                ).map(s => (
                                    <button
                                        key={s}
                                        className="algochat-suggestion"
                                        onClick={() => { setInput(s); inputRef.current?.focus(); }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
                    <div ref={bottomRef} />
                </div>

                {user ? (
                    <div className="algochat-input-row">
                        <textarea
                            ref={inputRef}
                            className="algochat-input"
                            rows={1}
                            placeholder={quizMode ? "Type your answer…" : "Ask about this step…"}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={streaming}
                        />
                        <button
                            className="algochat-send"
                            onClick={send}
                            disabled={!input.trim() || streaming}
                        >
                            {streaming ? (
                                <span className="algochat-spinner" />
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
                                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="algochat-locked">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        <p className="algochat-locked-text">Sign in to use the AI Tutor</p>
                        <button className="algochat-locked-btn" onClick={() => { setIsOpen(false); onOpenAuth?.(); }}>
                            Sign in
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlgoChat;
