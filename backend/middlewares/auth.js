const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
    const header = req.headers['authorization'];
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Invalid or missing Authorization header" });
    }
    const token = header.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, authData) => {
        if (err) return res.status(403).json({ message: "Invalid or expired token" });
        req.user = authData; 
        next(); 
    });
};

module.exports = { verifyToken };