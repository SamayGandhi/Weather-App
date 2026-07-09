const { buildSchema } = require('graphql');
const axios = require('axios');
const { graphqlHTTP } = require('express-graphql');

// ===================================================================
// GRAPHQL API FOR WEATHER
// ===================================================================

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
        const apiKey = process.env.WEATHER_API_KEY; 
        if (!apiKey) throw new Error("API key missing in env");

        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const response = await axios.get(weatherUrl);
        
        return {
            city: response.data.name,
            temperature: `${response.data.main.temp}°C`,
            condition: response.data.weather[0].main,
            humidity: `${response.data.main.humidity}%`,
            windSpeed: `${response.data.wind.speed} m/s`
        };
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