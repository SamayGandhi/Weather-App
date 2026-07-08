require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken'); 
const axios = require('axios');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// --- GRAPHQL IMPORTS ---
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

// --- WEBSOCKET IMPORTS ---
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT;
const SECRET_KEY = process.env.JWT_SECRET ; 

const CLIENT_URL = process.env.CLIENT_URL ;
const BACKEND_URL = process.env.BACKEND_URL ;

// --- CREATE HTTP SERVER & SOCKET.IO ---
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} request to: ${req.url}`);
    next();
});

// --- 1. OAUTH2 CONFIGURATION (PASSPORT.JS) ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${BACKEND_URL}/auth/google/callback`
  },
  (accessToken, refreshToken, profile, done) => {
    const user = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value
    };
    return done(null, user);
  }
));

// --- 2. AUTHENTICATION ROUTES (TRADITIONAL & GOOGLE) ---
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username and password are required" });
    
    if (username === "admin" && password === "1234") {
        const token = jwt.sign({ user: username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: "Login Successful", token: token });
    } else {
        res.status(401).json({ message: "Invalid Credentials" });
    }
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/error' }),
  (req, res) => {
    const token = jwt.sign(
        { id: req.user.id, email: req.user.email, name: req.user.name }, 
        SECRET_KEY, 
        { expiresIn: '1h' }
    );
    res.status(200).json({
        message: "Google OAuth2 Login Successful",
        user: req.user,
        token: token
    });
  }
);

app.get('/api/auth/error', (req, res) => res.status(401).json({ message: "Google Authentication Failed" }));

const verifyToken = (req, res, next) => {
    const header = req.headers['authorization'];
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Invalid or missing Authorization header" });
    }
    const token = header.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, authData) => {
        if (err) return res.status(403).json({ message: "Invalid or expired token" });
        req.user = authData; 
        next(); 
    });
};

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

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true, // Enables the browser-based GraphQL UI
}));

// --- 4. CRUD OPERATIONS (Favorites - Protected by JWT) ---
let favoriteCities = []; 

app.post('/api/favorites', verifyToken, (req, res) => {
    const cityName = req.body.name;
    if (!cityName || cityName.trim() === "") return res.status(400).json({ message: "City name cannot be empty" });
    
    if (favoriteCities.find(c => c.name.toLowerCase() === cityName.toLowerCase())) {
        return res.status(409).json({ message: "City already exists" });
    }
    const newCity = { id: Date.now(), name: cityName };
    favoriteCities.push(newCity);
    res.status(201).json({ message: "City added", city: newCity });
});

app.get('/api/favorites', verifyToken, (req, res) => {
    res.json(favoriteCities);
});

app.put('/api/favorites/:id', verifyToken, (req, res) => {
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

app.delete('/api/favorites/:id', verifyToken, (req, res) => {
    const cityId = parseInt(req.params.id);
    const initialLength = favoriteCities.length;
    favoriteCities = favoriteCities.filter(c => c.id !== cityId);
    
    if (favoriteCities.length === initialLength) return res.status(404).json({ message: "City ID not found" });
    res.json({ message: "City deleted successfully" });
});

// --- 5. WEBSOCKETS LOGIC  ---
io.on('connection', (socket) => {
    console.log(`Frontend Connected to WebSockets: ${socket.id}`);
    
    // Simulate a real-time push notification every 10 seconds
    setInterval(() => {
        socket.emit('weatherAlert', {
            message: "🚨 Real-Time Alert: Sudden cloud cover and heavy rainfall expected!"
        });
    }, 10000);

    socket.on('disconnect', () => console.log('Frontend Disconnected'));
});

// IMPORTANT: Use server.listen instead of app.listen for WebSockets
server.listen(PORT, () => console.log(`Server and WebSockets are running on ${BACKEND_URL}`));