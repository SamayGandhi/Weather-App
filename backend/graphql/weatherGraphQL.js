const { buildSchema } = require('graphql');
const axios = require('axios');
const { graphqlHTTP } = require('express-graphql');

// ===================================================================
// Implementing a Custom Hash Map (Data Structure) with a TTL Algorithm
// ===================================================================
const weatherCache = new Map(); // Hash Table Data Structure
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes in milliseconds (Algorithm Parameter)

const schema = buildSchema(`
  type Weather {
    city: String
    temperature: String
    condition: String
    humidity: String
    windSpeed: String
  }

  type Query {
    getWeather(city: String!): Weather
  }
`);

const root = {
  getWeather: async ({ city }) => {
    try {
        const cityName = city.toLowerCase(); // Standardize key for Hash Map
        const currentTime = Date.now();

        // Algorithm step: Check if data exists in Hash Map and is not expired
        if (weatherCache.has(cityName)) {
            const cachedData = weatherCache.get(cityName);
            if (currentTime - cachedData.timestamp < CACHE_TTL) {
                console.log(`[DSA Cache Hit] O(1) Lookup for: ${city}`);
                return cachedData.data; // Return cached data directly
            } else {
                // Expired data, remove from Map
                weatherCache.delete(cityName);
            }
        }

        // If not in cache, fetch from external API
        console.log(`[API Call] Fetching fresh data for: ${city}`);
        const apiKey = process.env.WEATHER_API_KEY; 
        if (!apiKey) throw new Error("API key missing in env");

        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const response = await axios.get(weatherUrl);
        
        const weatherResult = {
            city: response.data.name,
            temperature: `${response.data.main.temp}°C`,
            condition: response.data.weather[0].main,
            humidity: `${response.data.main.humidity}%`,
            windSpeed: `${response.data.wind.speed} m/s`
        };

        // Algorithm step: Store new data in Hash Map with timestamp
        weatherCache.set(cityName, {
            timestamp: currentTime,
            data: weatherResult
        });

        return weatherResult;
    } catch (error) {
        throw new Error("Failed to fetch weather data");
    }
  }
};

const graphqlMiddleware = graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true, // Enables the browser-based GraphQL UI
});

module.exports = graphqlMiddleware;