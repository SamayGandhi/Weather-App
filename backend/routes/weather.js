const express = require('express');
const router = express.Router();

// --- 3. EXTERNAL API INTEGRATION (Weather) ---

/*
===================================================================
 REST API FOR WEATHER
===================================================================
app.get('/api/weather/:city', async (req, res) => {
    try {
        const city = req.params.city;
        const apiKey = process.env.WEATHER_API_KEY; 
        if (!apiKey) return res.status(500).json({ message: "API key missing in env" });

        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const response = await axios.get(weatherUrl);
        
        const processedData = {
            city: response.data.name,
            temperature: `${response.data.main.temp}°C`,
            condition: response.data.weather[0].main,
            humidity: `${response.data.main.humidity}%`,
            windSpeed: `${response.data.wind.speed} m/s`
        };
        res.json(processedData);
    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).json({ message: "Weather API Error", details: error.response.data.message });
        }
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});
*/

module.exports = router;