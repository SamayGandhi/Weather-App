const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');

// --- 4. CRUD OPERATIONS (Favorites - Protected by JWT) ---
let favoriteCities = []; 

router.post('/api/favorites', verifyToken, (req, res) => {
    const cityName = req.body.name;
    if (!cityName || cityName.trim() === "") return res.status(400).json({ message: "City name cannot be empty" });
    
    if (favoriteCities.find(c => c.name.toLowerCase() === cityName.toLowerCase())) {
        return res.status(409).json({ message: "City already exists" });
    }
    const newCity = { id: Date.now(), name: cityName };
    favoriteCities.push(newCity);
    res.status(201).json({ message: "City added", city: newCity });
});

router.get('/api/favorites', verifyToken, (req, res) => {
    res.json(favoriteCities);
});

router.put('/api/favorites/:id', verifyToken, (req, res) => {
    const cityId = parseInt(req.params.id);
    const newName = req.body.name;
    if (!newName || newName.trim() === "") return res.status(400).json({ message: "Name cannot be empty" });

    if (favoriteCities.find(c => c.name.toLowerCase() === newName.toLowerCase() && c.id !== cityId)) {
        return res.status(409).json({ message: "City name already exists" });
    }

    let city = favoriteCities.find(c => c.id === cityId);
    if (city) {
        city.name = newName;
        res.json({ message: "City updated", city: city });
    } else {
        res.status(404).json({ message: "City ID not found" });
    }
});

router.delete('/api/favorites/:id', verifyToken, (req, res) => {
    const cityId = parseInt(req.params.id);
    const initialLength = favoriteCities.length;
    favoriteCities = favoriteCities.filter(c => c.id !== cityId);
    
    if (favoriteCities.length === initialLength) return res.status(404).json({ message: "City ID not found" });
    res.json({ message: "City deleted successfully" });
});

module.exports = router;