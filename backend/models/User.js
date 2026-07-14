const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true // (MongoDB automatically creates an index for unique fields)
    },
    displayName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        index: true //Query Optimization
    },
    avatar: {
        type: String
    },
    phone: {
        type: String,
        default: "" 
    },
    smsAlerts: {
        type: Boolean,
        default: false 
    },
    emailAlerts: {
        type: Boolean,
        default: false 
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);