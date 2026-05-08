const passport       = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db             = require("../db/connection");
const { resolveCollege } = require("../utils/resolveCollege");

passport.use(new GoogleStrategy(
    {
        clientID:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:  process.env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
        try {
            const email    = profile.emails[0].value;
            const username = profile.displayName;

            const [rows] = await db.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);

            if (rows.length > 0) {
                return done(null, rows[0]);
            }

            const college = await resolveCollege(email);
            console.log(`[SSO] email=${email} → college=${college}`);

            const [result] = await db.query(
                "INSERT INTO users (username, email, password, college) VALUES (?, ?, ?, ?)",
                [username, email, "", college || null]
            );

            const newUser = { id: result.insertId, username, email, college };
            return done(null, newUser);
        } catch (err) {
            return done(err, null);
        }
    }
));

module.exports = passport;
