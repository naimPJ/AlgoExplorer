require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const passport     = require("./middleware/passport");
const authRoutes   = require("./routes/auth");
const googleRoutes = require("./routes/google");
const chatRoutes   = require("./routes/chat");

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(passport.initialize());

app.use("/api/auth",        authRoutes);
app.use("/api/auth/google", googleRoutes);
app.use("/api/chat",        chatRoutes);

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

module.exports = app;
