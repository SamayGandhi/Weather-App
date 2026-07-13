const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL;

// --- 2. AUTHENTICATION ROUTES (TRADITIONAL & GOOGLE) ---
router.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username and password are required" });
    
    if (username === "admin" && password === "1234") {
        const token = jwt.sign({ user: username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: "Login Successful", token: token });
    } else {
        res.status(401).json({ message: "Invalid Credentials" });
    }
});

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' })
);

router.get('/auth/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/error' }),
  (req, res) => {
    const token = jwt.sign(
        { 
            id: req.user._id, 
            email: req.user.email, 
            name: req.user.displayName
        }, 
        SECRET_KEY, 
        { expiresIn: '1h' }
    );
    
    res.redirect(`${CLIENT_URL}?token=${token}`);
  }
);

router.get('/api/auth/error', (req, res) => res.status(401).json({ message: "Google Authentication Failed" }));

module.exports = router;