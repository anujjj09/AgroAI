# 🌾 AgroAI - Intelligent Agricultural Assistant

<div align="center">

![AgroAI Banner](https://img.shields.io/badge/AgroAI-v2.0-green?style=for-the-badge&logo=leaf&logoColor=white)
![React](https://img.shields.io/badge/React-18.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-18.0-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.0-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

*Revolutionizing agriculture with AI-powered insights for Punjab farmers*

[🚀 Live Demo](https://agroai-tfey.onrender.com) • [📖 Features](#features) • [🛠️ Setup](#installation) • [🤝 Contribute](#contributing)

</div>

---

## 🌟 Overview

**AgroAI** is a comprehensive agricultural technology platform designed specifically for Punjab farmers. It combines artificial intelligence, real-time data, and multilingual support to provide personalized farming assistance, smart advisory services, pest detection, weather insights, and market intelligence.

Built with modern web technologies and powered by Google's Gemini AI, AgroAI transforms traditional farming practices into data-driven, intelligent decision-making processes.

### 🎯 Mission
*Empowering Punjab's agricultural community with AI-driven insights to increase productivity, reduce losses, and promote sustainable farming practices through technology.*

## ✨ Key Features

### 🎯 Smart Advisory System
- **AI-Powered Recommendations**: Personalized farming advice integrating weather, market, and AI insights
- **Comprehensive Analysis**: Real-time weather data, 5-day forecasts, and market price trends
- **Immediate & Long-term Actions**: 48-hour tasks and weekly strategic planning
- **Financial Insights**: Market-driven selling/holding recommendations
- **Multi-crop Support**: Wheat, Rice, Cotton, Maize, Sugarcane, Soybean, Mustard, Potato

### 🤖 AI Chat Assistant
- **Google Gemini AI**: Advanced conversational AI for farming questions
- **Context-Aware Responses**: Tailored advice based on location, weather, and market data
- **Enhanced Intelligence**: Incorporates real-time weather and market context
- **Multilingual Support**: English, Hindi, and Punjabi responses
- **Smart Fallback System**: Works even when AI services are temporarily unavailable

### 🔍 Smart Pest Detection
- **AI Vision Analysis**: Upload crop photos for instant pest and disease identification
- **Comprehensive Reports**: Detailed analysis with symptoms and treatment options
- **Treatment Recommendations**: Both organic and chemical solutions
- **Prevention Strategies**: Proactive measures to avoid future infestations

### 🌤️ Weather Intelligence
- **Real-time Data**: Current weather conditions and atmospheric data
- **5-Day Forecasts**: Detailed weather predictions for farming planning
- **Agricultural Alerts**: Weather-based farming recommendations
- **District-Specific**: Accurate data for all Punjab districts

### 📈 Market Intelligence
- **Live Mandi Prices**: Real-time crop prices across Punjab markets
- **Price Trends**: Historical analysis and trend predictions
- **Profit Analysis**: Market-driven crop selection recommendations
- **Multi-commodity Tracking**: Major crops with price change indicators

### 🌍 Multilingual Platform
- **🇬🇧 English**: Complete interface and AI responses
- **🇮🇳 हिन्दी (Hindi)**: Full native language support
- **🇮🇳 ਪੰਜਾਬੀ (Punjabi)**: Regional language for local farmers
- **Smart Detection**: AI adapts responses to user's preferred language

## 🏗️ Technology Stack

### Frontend
- **React 18**: Modern component-based UI
- **CSS3**: Responsive design with custom styling
- **Multilingual**: Complete translation system
- **Progressive Web App**: Mobile-optimized experience

### Backend
- **Node.js & Express**: RESTful API architecture
- **PostgreSQL**: Robust relational database
- **Sequelize ORM**: Database modeling and queries
- **JWT Authentication**: Secure user sessions

### AI & External Services
- **Google Gemini AI**: Text generation and vision analysis
- **OpenWeatherMap**: Real-time weather data
- **Market Data APIs**: Live commodity prices
- **Twilio**: SMS notifications (optional)

### Infrastructure
- **Frontend**: Netlify deployment
- **Backend**: Render/Railway hosting
- **Database**: PostgreSQL (cloud or local)
- **CDN**: Global content delivery

## 🚀 Installation & Setup

### 📋 Prerequisites

- **Node.js** (v18.0 or higher)
- **PostgreSQL** (v13.0 or higher)
- **Google Gemini API Key**
- **OpenWeatherMap API Key**

### ⚡ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/dhreetijain04/AgroAI.git
cd AgroAI

# 2. Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys

# 3. Frontend setup  
cd ../client
npm install

# 4. Start development servers
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend  
cd client && npm start
```

### 🔐 Environment Configuration

Create `.env` file in the `backend/` directory:

```bash
# Server Configuration
NODE_ENV=development
PORT=5000

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agroai
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Secret (Generate strong random string)
JWT_SECRET=your_secure_jwt_secret_key

# API Keys (Required)
GEMINI_API_KEY=your_gemini_api_key
WEATHER_API_KEY=your_openweather_api_key

# Optional: SMS notifications
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

### 🔑 Getting API Keys

1. **Google Gemini AI**:
   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Create new API key
   - Add to `GEMINI_API_KEY`

2. **OpenWeatherMap**:
   - Sign up at [OpenWeatherMap](https://openweathermap.org/api)
   - Get free API key
   - Add to `WEATHER_API_KEY`

## ��� Project Structure

```

## � Project Structure

```
AgroAI/
├── backend/                 # Node.js backend server
│   ├── models/             # Database models
│   ├── routes/             # API endpoints
│   ├── middleware/         # Authentication & validation
│   ├── utils/              # Helper functions
│   ├── server-real.js      # Main server file
│   └── package.json        # Backend dependencies
├── client/                 # React frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── contexts/       # React contexts (Language)
│   │   ├── translations/   # Multilingual support
│   │   ├── utils/          # API utilities
│   │   └── App.js          # Main React component
│   └── package.json        # Frontend dependencies
├── test-advisory.js        # API testing script
├── netlify.toml           # Netlify deployment config
└── README.md              # Project documentation
```

## 🚀 Deployment Guide

### 🖥️ Backend Deployment (Render/Railway)

1. **Environment Variables**:
   ```bash
   NODE_ENV=production
   JWT_SECRET=your_production_secret
   GEMINI_API_KEY=your_gemini_key
   WEATHER_API_KEY=your_weather_key
   DATABASE_URL=your_postgresql_url
   ```

2. **Deploy Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server-real.js`

### 🌐 Frontend Deployment (Netlify)

1. **Build Settings**:
   - **Base Directory**: `client`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `client/build`

2. **Environment Variables**:
   ```bash
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```

### 🔗 URLs
- **Frontend**: https://your-app.netlify.app
- **Backend**: https://your-backend.onrender.com
- **Health Check**: https://your-backend.onrender.com/api/health

## � Testing

### API Testing
Run the comprehensive test script:
```bash
cd backend
node ../test-advisory.js
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Language switching (English/Hindi/Punjabi)
- [ ] Smart Advisory system with crop recommendations
- [ ] Weather data display and forecasts
- [ ] Market prices and trends
- [ ] AI Chat responses with context
- [ ] Pest detection with image upload

### Health Checks
- **Backend Health**: `GET /api/health`
- **Weather API**: `GET /api/weather/Ludhiana`
- **Market API**: `GET /api/market/Punjab`
- **Advisory API**: `POST /api/advisory`

## 🐛 Troubleshooting

### Common Issues

1. **Weather/Chat not working**:
   - Check API keys in environment variables
   - Verify proxy configuration in `client/package.json`
   - Check browser console for errors

2. **Database connection errors**:
   - Ensure PostgreSQL is running
   - Verify DATABASE_URL format
   - Check database credentials

3. **CORS errors**:
   - Update allowed origins in backend
   - Check proxy configuration
   - Verify environment URLs

### Support
- Check existing [Issues](https://github.com/dhreetijain04/AgroAI/issues)
- Create new issue with detailed description
- Include error logs and environment details

## �🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/your-username/AgroAI.git`
3. **Create** feature branch: `git checkout -b feature/amazing-feature`
4. **Make** your changes with proper testing
5. **Commit** changes: `git commit -m 'Add amazing feature'`
6. **Push** to branch: `git push origin feature/amazing-feature`
7. **Open** Pull Request with detailed description

### Contribution Guidelines
- Follow existing code style and structure
- Add tests for new features
- Update documentation as needed
- Ensure multilingual support where applicable

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Punjab Agricultural University** - Agricultural domain expertise
- **Google AI Team** - Gemini AI platform and support
- **OpenWeatherMap** - Weather data services
- **Open Source Community** - Tools, frameworks, and inspiration
- **Punjab Farmers** - Feedback and real-world testing

---

<div align="center">

**🌾 Built with ❤️ for Punjab's Farming Community 🌾**

![Made in India](https://img.shields.io/badge/Made%20in-India-ff9933?style=for-the-badge&labelColor=white&color=138808)

*Empowering Agriculture Through Technology*

**Star ⭐ this repo if it helped you!**

</div>
