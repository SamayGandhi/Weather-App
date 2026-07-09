const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const BACKEND_URL = process.env.BACKEND_URL;

// --- 1. OAUTH2 CONFIGURATION (PASSPORT.JS) ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${BACKEND_URL}/auth/google/callback`
  },
  (accessToken, refreshToken, profile, done) => {
    const user = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value
    };
    return done(null, user);
  }
));

module.exports = passport;