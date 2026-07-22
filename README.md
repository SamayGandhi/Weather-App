# 🌦️ Weather Forecast System

A secure, full-stack Weather Forecast System built with **React.js, Node.js, Express.js, MongoDB, GraphQL, Redis, and Twilio**. The application allows users to search for real-time weather information, save favorite cities, authenticate securely using Google OAuth, and receive automated SMS weather alerts.

---

## 🚀 Live Demo

- **Frontend:** https://weather-app-kappa-blond-45.vercel.app/

---

# 📖 Project Overview

The Weather Forecast System is designed to provide users with real-time weather information while demonstrating modern full-stack development practices.

The application focuses on:

- Secure Authentication
- High Performance
- Enterprise-Level Security
- Automated Background Services
- Scalable Backend Architecture
- Modern Frontend Development

---

# ✨ Features

## 🔐 Authentication

- Google OAuth Login
- JWT Authentication
- Protected Routes
- Secure Session Management

---

## 🌤 Weather Services

- Search weather by city
- Real-time weather data
- Weather details including:
  - Temperature
  - Humidity
  - Wind Speed
  - Weather Condition
  - Feels Like Temperature
- Fast weather search experience

---

## ⭐ Favorite Cities

- Save favorite cities
- Remove favorite cities
- View saved locations anytime
- Personalized weather tracking

---

## 📱 SMS Weather Alerts

- Twilio API Integration
- Automatic weather notifications
- SMS sent whenever weather changes for favorite cities
- Background monitoring using Cron Jobs

---

## ⚡ Performance Optimization

- GraphQL API
- Redis Caching
- Reduced API calls
- Faster response time
- Optimized database queries

---

## 🛡 Security Features

### Helmet.js

- XSS Protection
- Secure HTTP Headers
- Clickjacking Protection
- MIME Sniffing Protection

### CORS

- Strict Origin Validation
- Cross-Origin Request Protection

### Mongo Sanitize

- Prevents NoSQL Injection
- Sanitizes malicious MongoDB operators

### JWT

- Secure Authentication
- Protected API Access

---

# 🛠 Tech Stack

## Frontend

- React.js
- React Router
- Axios
- Lazy Loading
- CSS

---

## Backend

- Node.js
- Express.js
- GraphQL
- JWT
- Passport.js
- Google OAuth
- Redis
- Node Cron

---

## Database

- MongoDB
- Mongoose

---

## External APIs

- OpenWeather API
- Twilio API

---

# 📂 Project Structure

```
WEATHER_FORECAST/
│
├── .github/
│
├── backend/
│   ├── config/
│   ├── cron/
│   ├── graphql/
│   ├── middlewares/
│   ├── models/
│   ├── queue/
│   ├── routes/
│   ├── sockets/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── FavoritesList.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── NotificationSettings.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── WeatherDisplay.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── .env
│
└── README.md
```

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/SamayGandhi/Weather-App.git
```

```bash
cd weather-forecast-system
```

---

## Install Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Install Backend

```bash
cd backend
npm install
npm start
```

---

# 🔑 Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=5000

CLIENT_URL=your_client_url

BACKEND_URL=your_backend_url

MONGODB_URI=your_mongodb_connection

JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id

GOOGLE_CLIENT_SECRET=your_google_client_secret

SMTP_HOST=your_smtp_host

SMTP_PORT=your_smtp_port

SMTP_USER=your_smtp_user

SMTP_PASS=your_smtp_pass

WEATHER_API_KEY=your_weather_api_key

TWILIO_ACCOUNT_SID=your_account_sid

TWILIO_AUTH_TOKEN=your_auth_token

TWILIO_PHONE_NUMBER=your_twilio_phone

REDIS_URL=your_redis_url
```

---

# 📡 API Features

- User Authentication
- Google OAuth Login
- Weather Search
- Favorite Cities
- GraphQL Queries
- SMS Notifications
- JWT Protected APIs

---

# 🚀 Performance Enhancements

- GraphQL for efficient data fetching
- Redis caching for faster responses
- Lazy Loading on frontend
- Optimized MongoDB queries
- Background Cron Jobs
- Reduced API requests

---

# 🔒 Security

- Helmet.js
- JWT Authentication
- Google OAuth
- CORS Protection
- MongoDB Sanitization
- Protected Routes
- Environment Variables
- Secure API Architecture

---

# 📸 Screenshots

Add screenshots of:

- Home Page
- Login Page
- Weather Search
- Favorite Cities
- SMS Notification
- GraphQL Playground
- MongoDB Database
- Redis Cache
- API Testing (Postman)

---

# 📚 Future Improvements

- Weather Forecast Charts
- Dark Mode
- Multi-language Support
- Push Notifications
- Email Notifications
- Weather Maps
- Air Quality Index
- Hourly Forecast
- Weekly Forecast
- PWA Support

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create your feature branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push to the branch

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

**Samay Gandhi**

- GitHub: https://github.com/SamayGandhi
- LinkedIn: https://www.linkedin.com/in/samay-gandhi-1b468b2b8

---

⭐ If you found this project useful, don't forget to give it a **Star** on GitHub!
