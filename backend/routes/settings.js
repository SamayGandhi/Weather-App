const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middlewares/auth'); 

// 1. GET
router.get('/api/settings', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({
            phone: user.phone,
            smsAlerts: user.smsAlerts,
            emailAlerts: user.emailAlerts
        });
    } catch (error) {
        console.error("[Settings GET Error]:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// 2. PUT
router.put('/api/settings', verifyToken, async (req, res) => {
    try {
        const { phone, smsAlerts, emailAlerts } = req.body;
        
        if (smsAlerts) {
            if (!phone || !phone.startsWith('+') || phone.length < 10) {
                return res.status(400).json({ 
                    message: "Please include a valid country code (e.g., +91) OR Enter a valid Number for SMS alerts." 
                });
            }
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { phone, smsAlerts, emailAlerts },
            { returnDocument: 'after' } 
        );

        res.json({ 
            message: "Settings updated successfully", 
            settings: {
                phone: updatedUser.phone,
                smsAlerts: updatedUser.smsAlerts,
                emailAlerts: updatedUser.emailAlerts
            }
        });
    } catch (error) {
        console.error("[Settings PUT Error]:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
module.exports = router;