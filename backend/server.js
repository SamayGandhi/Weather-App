require('dotenv').config();
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const express = require('express');
const cors = require('cors');
const passport = require('passport');


//--- MONGODB CONNECTION ---//
const connectDB = require('./config/db');
connectDB(); 

// Import Modules
require('./config/passport');
const authRoutes = require('./routes/auth');
const weatherRoutes = require('./routes/weather');
const favoritesRoutes = require('./routes/favorites');
const graphqlMiddleware = require('./graphql/weatherGraphQL');
const setupSockets = require('./sockets/index');
const weatherRedisRoute = require('./routes/weatherRedis');

// --- WEBSOCKET IMPORTS ---
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;
const BACKEND_URL = process.env.BACKEND_URL;

// --- CREATE HTTP SERVER & SOCKET.IO ---
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"]
    }
});

// Middleware

// CSRF Protection & CORS Hardening
const allowedOrigins = [
  'https://weather-app-kappa-blond-45.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173' // for Local testing
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy (CSRF Protection Active)'));
    }
  },
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'] 
}));

app.use(helmet()); // Secure the HTTP Header and Block the XSS Attacks
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Prevent NoSQL Injection 
app.use((req, res, next) => {
    if (req.body) mongoSanitize.sanitize(req.body);
    if (req.params) mongoSanitize.sanitize(req.params);
    if (req.query) mongoSanitize.sanitize(req.query);
    next();
});

app.use(passport.initialize());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} request to: ${req.url}`);
    next();
});

// Use Routes
app.use('/', authRoutes);
app.use('/', weatherRoutes);
app.use('/', favoritesRoutes);

// Use GraphQL
app.use('/graphql', graphqlMiddleware);

app.use('/api', weatherRedisRoute);
app.use('/', require('./routes/settings'));

require('./cron/weatherCron'); 

// Setup WebSockets
setupSockets(io);

// IMPORTANT: Use server.listen instead of app.listen for WebSockets
server.listen(PORT, () => console.log(`Server and WebSockets are running on ${BACKEND_URL}`));