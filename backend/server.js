require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');

// Import Modules
require('./config/passport'); // Initialize passport strategy
const authRoutes = require('./routes/auth');
const weatherRoutes = require('./routes/weather');
const favoritesRoutes = require('./routes/favorites');
const graphqlMiddleware = require('./graphql/weatherGraphQL');
const setupSockets = require('./sockets/index');

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
app.use(cors());
app.use(express.json());
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

// Setup WebSockets
setupSockets(io);

// IMPORTANT: Use server.listen instead of app.listen for WebSockets
server.listen(PORT, () => console.log(`Server and WebSockets are running on ${BACKEND_URL}`));