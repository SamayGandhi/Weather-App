const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); 
const BACKEND_URL = process.env.BACKEND_URL;

// --- 1. OAUTH2 CONFIGURATION (PASSPORT.JS) ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${BACKEND_URL}/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
       
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
            
            return done(null, user);
        } else {
           
            const newUser = new User({
                googleId: profile.id,
                displayName: profile.displayName,
                email: profile.emails[0].value,
               
                avatar: profile.photos[0]?.value || '' 
            });
            await newUser.save();
            return done(null, newUser);
        }
    } catch (error) {
        console.error("[Passport Error]:", error);
        return done(error, null);
    }
  }
));

module.exports = passport;