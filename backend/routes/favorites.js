const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const Favorite = require('../models/Favorite');

// --- 4. CRUD OPERATIONS (Favorites - Protected by JWT) ---

router.post('/api/favorites', verifyToken, async (req, res) => {
    try {
        const cityName = req.body.name;
        if (!cityName || cityName.trim() === "") return res.status(400).json({ message: "City name cannot be empty" });
        
        const existingCity = await Favorite.findOne({ 
            userId: req.user.id, 
            cityName: { $regex: new RegExp(`^${cityName}$`, "i") } 
        });

        if (existingCity) {
            return res.status(409).json({ message: "City already exists" });
        }

        // Save new favorite city to MongoDB
        const newFavorite = new Favorite({
            userId: req.user.id,
            cityName: cityName
        });
        await newFavorite.save();
        
        // Return matching format for frontend
        res.status(201).json({ message: "City added", city: { id: newFavorite._id, name: newFavorite.cityName } });
    } catch (error) {
        console.error("[Favorite POST Error]:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get('/api/favorites', verifyToken, async (req, res) => {
    try {
        // Fetch only the logged-in user's favorites from MongoDB
        const favorites = await Favorite.find({ userId: req.user.id });
        
        const formattedFavorites = favorites.map(fav => ({
            id: fav._id,
            name: fav.cityName
        }));
        
        res.json(formattedFavorites);
    } catch (error) {
        console.error("[Favorite GET Error]:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.put('/api/favorites/:id', verifyToken, async (req, res) => {
    try {
        const cityId = req.params.id;
        const newName = req.body.name;
        if (!newName || newName.trim() === "") return res.status(400).json({ message: "Name cannot be empty" });

        const duplicateCheck = await Favorite.findOne({
            userId: req.user.id,
            cityName: { $regex: new RegExp(`^${newName}$`, "i") },
            _id: { $ne: cityId }
        });

        if (duplicateCheck) {
            return res.status(409).json({ message: "City name already exists" });
        }

        // Update city in MongoDB
        const updatedCity = await Favorite.findOneAndUpdate(
            { _id: cityId, userId: req.user.id },
            { cityName: newName },
            { new: true }
        );

        if (updatedCity) {
            res.json({ message: "City updated", city: { id: updatedCity._id, name: updatedCity.cityName } });
        } else {
            res.status(404).json({ message: "City ID not found or unauthorized" });
        }
    } catch (error) {
        console.error("[Favorite PUT Error]:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.delete('/api/favorites/:id', verifyToken, async (req, res) => {
    try {
        const cityId = req.params.id;
        
        // Delete from MongoDB ensuring it belongs to the logged-in user
        const deletedCity = await Favorite.findOneAndDelete({ _id: cityId, userId: req.user.id });
        
        if (!deletedCity) return res.status(404).json({ message: "City ID not found or unauthorized" });
        
        res.json({ message: "City deleted successfully" });
    } catch (error) {
        console.error("[Favorite DELETE Error]:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;