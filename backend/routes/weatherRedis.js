const express = require('express');
const axios = require('axios');
const redis = require('redis');
const alertQueue = require('../queue/alertQueue');

const router = express.Router();

// ===================================================================
// Implementing Redis to cache weather data and reduce API calls.
// Using Fallback Pattern to ensure live app never breaks.
// ===================================================================

// Initialize Redis Client (Connects to cloud Redis if URL provided, else local)
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('[Redis Error] Safe fallback activated:', err.message));
redisClient.on('connect', () => console.log('[Redis Connected] Ready for caching'));

// Connect asynchronously (no await at top level to prevent blocking)
redisClient.connect().catch(console.error);

router.get('/cache-weather/:city', async (req, res) => {
    const city = req.params.city.toLowerCase();
    const apiKey = process.env.WEATHER_API_KEY;

    try {
        // Step 1: Check if Redis is connected and data exists in Cache
        if (redisClient.isReady) {
            const cachedWeather = await redisClient.get(`weather:${city}`);
            if (cachedWeather) {
                console.log(`[Redis Cache Hit] Fast response for: ${city}`);
                return res.json({ source: 'Redis Cache', data: JSON.parse(cachedWeather) });
            }
        }

        // Step 2: If not in cache (or Redis fails), fetch from External API
        console.log(`[API Call] Fetching fresh data for: ${city}`);
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const response = await axios.get(weatherUrl);
        
        const weatherData = {
            city: response.data.name,
            temperature: `${response.data.main.temp}°C`,
            condition: response.data.weather[0].main
        };
        // ---------------------------------------------------------
        // Trigger Background Queue if conditions are extreme
        // ---------------------------------------------------------
        const condition = response.data.weather[0].main.toLowerCase();
        if (condition === 'rain' || condition === 'thunderstorm' || condition === 'extreme') {
            alertQueue.addJob({
                alertType: 'Heavy Rainfall Warning',
                city: response.data.name
            });
        }

        // Step 3: Store the fresh data in Redis for 15 minutes (900 seconds)
        if (redisClient.isReady) {
            await redisClient.setEx(`weather:${city}`, 900, JSON.stringify(weatherData));
        }

        return res.json({ source: 'External API', data: weatherData });

    } catch (error) {
        console.error("Error fetching weather:", error.message);
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
});

module.exports = router;