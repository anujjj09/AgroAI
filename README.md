# AgroAI - Smart Crop Advisory System (PERN Stack)

A comprehensive agricultural advisory platform built with PostgreSQL, Express.js, React, and Node.js, designed specifically for Punjab farmers.

## 🚀 Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT with SMS/OTP verification
- **External APIs**: OpenWeatherMap, Government of India Market Data, Google Gemini AI

## 📁 Project Structure

```
AgroAI-Project/
├── backend/                 # Express.js API server
│   ├── config/             # Database configuration
│   ├── models/             # Sequelize models
│   ├── routes/             # API route handlers
│   ├── middleware/         # Custom middleware
│   ├── services/           # External service integrations
│   └── server.js           # Main server file
├── frontend/               # React application
│   ├── src/               # React source code
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
└── index.html             # Original prototype (legacy)
```

## 🌟 Features

### Core Features
1. **Multilingual Support** - English, Hindi, Punjabi
2. **SMS/OTP Authentication** - Secure phone-based login
3. **Crop Advisory** - AI-powered farming recommendations
4. **Weather Integration** - Real-time weather data for all 22 Punjab districts
5. **Market Data** - Government API integration for crop prices
6. **Pest Detection** - AI-powered image analysis
7. **Community Forum** - Farmer discussion platform
8. **Notification System** - Weather alerts, market updates
9. **User Profiles** - Crop tracking, farming experience
10. **District-Specific Data** - Localized information for Punjab

### Punjab Districts Supported
- Amritsar, Barnala, Bathinda, Faridkot, Fatehgarh Sahib
- Fazilka, Ferozepur, Gurdaspur, Hoshiarpur, Jalandhar
- Kapurthala, Ludhiana, Mansa, Moga, Muktsar
- Pathankot, Patiala, Rupnagar, Sahibzada Ajit Singh Nagar
- Sangrur, Shaheed Bhagat Singh Nagar, Tarn Taran

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Database**
   ```bash
   # Create PostgreSQL database
   createdb agroai
   ```

3. **Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Required Environment Variables**
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=agroai
   DB_USER=postgres
   DB_PASSWORD=your_password

   # JWT
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret

   # External APIs
   OPENWEATHER_API_KEY=your_openweather_key
   MARKET_API_KEY=your_market_api_key
   GEMINI_API_KEY=your_gemini_key

   # Optional: SMS Service
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=your_twilio_number
   ```

5. **Start Backend Server**
   ```bash
   npm start
   # Development mode: npm run dev
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start React Development Server**
   ```bash
   npm start
   ```

3. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🗄️ Database Schema

### Users Table
- User authentication and profile information
- District-based location data
- Farming experience and crop preferences
- Notification settings

### OTPs Table
- SMS verification codes
- Expiration and usage tracking
- Phone number validation

### Crops Table
- User crop tracking
- Planting and harvest dates
- Crop varieties and areas

### Community Tables
- Forum posts and replies
- User reputation system
- Voting and moderation

## 🔐 Security Features

- **Rate Limiting**: Different limits for auth, API calls, uploads
- **Input Validation**: Comprehensive data validation
- **JWT Authentication**: Secure token-based auth
- **CORS Configuration**: Cross-origin request handling
- **Helmet Security**: Security headers and CSP
- **Logging System**: Winston-based logging with file output

## 📊 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP for verification
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/refresh` - Refresh JWT token

### Weather
- `GET /api/weather/:district` - Get district weather
- `GET /api/weather/alerts/:district` - Weather alerts

### Market Data
- `GET /api/market/:district` - Market prices
- `GET /api/market/trends/:commodity` - Price trends

### AI Services
- `POST /api/ai/chat` - Crop advisory chat
- `POST /api/ai/pest-detection` - Image-based pest detection

### Community
- `GET /api/community/posts` - Forum posts
- `POST /api/community/posts` - Create post
- `POST /api/community/replies` - Add reply

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Configure PostgreSQL database
3. Run database migrations: `npm run migrate`
4. Start production server: `npm start`

### Frontend Deployment
1. Build React app: `npm run build`
2. Serve build files via web server
3. Configure API endpoints for production

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenWeatherMap for weather data
- Government of India for market data API
- Google Gemini AI for crop advisory
- Punjab Agriculture Department for district information

---

**Built with ❤️ for Punjab farmers**
