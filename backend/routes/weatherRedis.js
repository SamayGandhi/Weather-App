const express = require('express');
const axios = require('axios');
const redis = require('redis');
const alertQueue = require('../queue/alertQueue');

const router = express.Router();

// ===================================================================
// Redis Initialization
// ===================================================================
let redisClient = null;

if (process.env.REDIS_URL) {
    redisClient = redis.createClient({ url: process.env.REDIS_URL });
    
    redisClient.on('error', (err) => console.error('[Redis Error]', err.message));
    redisClient.on('connect', () => console.log('[Redis Connected] Ready for caching'));
    
    redisClient.connect().catch(console.error);
} else {
    console.log('[Redis Cache] No REDIS_URL found. Running strictly on Live API.');
}

router.get('/cache-weather/:city', async (req, res) => {
    const city = req.params.city.toLowerCase();
    const apiKey = process.env.WEATHER_API_KEY;

    try {
        // Step 1: Check Cache
        if (redisClient && redisClient.isReady) {
            const cachedWeather = await redisClient.get(`weather:${city}`);
            if (cachedWeather) {
                console.log(`[Redis Cache Hit] Fast response for: ${city}`);
                return res.json({ source: 'Redis Cache', data: JSON.parse(cachedWeather) });
            }
        }

        // Step 2: Fetch Current Weather & Forecast Parallelly
        console.log(`[API Call] Fetching fresh data for: ${city}`);
        
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
        
        const [weatherResponse, forecastResponse] = await Promise.all([
            axios.get(weatherUrl),
            axios.get(forecastUrl)
        ]);
        
        const dailyForecasts = forecastResponse.data.list
            .filter(item => item.dt_txt.includes('12:00:00'))
            .slice(0, 3);
            
        const dynamicForecastData = dailyForecasts.map(day => {
            const date = new Date(day.dt * 1000);
            return {
                day: date.toLocaleDateString('en-US', { weekday: 'short' }), // (e.g., 'Mon', 'Tue')
                condition: day.weather[0].main,
                temp: `${Math.round(day.main.temp)}°C`
            };
        });

        const weatherData = {
            city: weatherResponse.data.name,
            temperature: `${weatherResponse.data.main.temp}°C`,
            condition: weatherResponse.data.weather[0].main,
            humidity: `${weatherResponse.data.main.humidity}%`, 
            windSpeed: `${weatherResponse.data.wind.speed} m/s`,
            forecast: dynamicForecastData 
        };

        const condition = weatherResponse.data.weather[0].main.toLowerCase();

        // COMMENTED OUT: notifications are disable for normal search.
        /*
        if (condition === 'rain' || condition === 'thunderstorm' || condition === 'extreme') {
            alertQueue.addJob({
                alertType: 'Heavy Rainfall Warning',
                city: weatherResponse.data.name
            });
        }
        */

        // Step 3: Cache the fresh combined data for 60 seconds
        if (redisClient && redisClient.isReady) {
            await redisClient.setEx(`weather:${city}`, 60, JSON.stringify(weatherData));
        }

        return res.json({ source: 'External API', data: weatherData });

    } catch (error) {
        console.error("Error fetching weather:", error.message);
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
});

// Smart Search Recommendations Route
router.get('/cities', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);
    
    try {
        const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${q}&limit=5&appid=${process.env.WEATHER_API_KEY}`;
        const response = await axios.get(geoUrl);
        
        const cities = response.data.map((city, index) => ({
            id: index,
            name: city.name,
            state: city.state || '',
            country: city.country 
        }));
        
        res.json(cities);
    } catch (error) {
        console.error("Error fetching city suggestions:", error.message);
        res.status(500).json({ error: "Failed to fetch cities" });
    }
});

module.exports = router;