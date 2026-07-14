const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true //Query Optimization
    },
    cityName: {
        type: String,
        required: true
    }
}, { timestamps: true });

favoriteSchema.index({ userId: 1, cityName: 1 }); //Query Optimization

module.exports = mongoose.model('Favorite', favoriteSchema);