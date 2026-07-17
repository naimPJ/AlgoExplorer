const router   = require("express").Router();
const passport = require("../middleware/passport");
const jwt      = require("jsonwebtoken");

const makeToken = (user) =>
    jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

// GET /api/auth/google  — redirect to Google
router.get("/", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

// GET /api/auth/google/callback  — Google redirects here
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

router.get(
    "/callback",
    passport.authenticate("google", { session: false, failureRedirect: `${CLIENT_URL}/auth?error=sso_failed` }),
    (req, res) => {
        const token = makeToken(req.user);
        const user  = {
            id:       req.user.id,
            username: req.user.username,
            email:    req.user.email,
            college:  req.user.college,
        };
        // Pass token + user to the frontend via query params, frontend stores them
        const params = new URLSearchParams({ token, user: JSON.stringify(user) });
        res.redirect(`${CLIENT_URL}/auth/callback?${params}`);
    }
);

module.exports = router;
