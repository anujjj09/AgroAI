# AgroAI Smart Advisory System

## Overview
The Smart Advisory System is an AI-powered feature that provides personalized farming recommendations by integrating:

- **Real-time Weather Data** - Current conditions and 5-day forecast
- **Market Price Analysis** - Current crop prices and trends  
- **AI-Powered Insights** - Gemini AI-generated recommendations
- **Pest Detection Integration** - Incorporates pest detection results

## Features

### 1. Comprehensive Data Integration
- **Weather API**: OpenWeatherMap integration for accurate weather data
- **Market Prices**: Real-time crop pricing with trend analysis
- **AI Analysis**: Google Gemini AI for intelligent recommendations
- **Multi-language Support**: English, Hindi, and Punjabi

### 2. Smart Recommendations
- **Immediate Actions**: 2-3 specific tasks for next 48 hours
- **Long-term Strategy**: Weekly planning based on forecast
- **Financial Insights**: Market-driven selling/holding recommendations

### 3. User-Friendly Interface
- **Crop Selection**: 8+ major crops with multilingual names
- **District Selection**: All Punjab districts supported
- **Visual Dashboard**: Weather cards, price charts, and action items
- **Responsive Design**: Works on all devices

## API Endpoints

### POST /api/advisory
Generates comprehensive crop advisory

**Request Body:**
```json
{
  "crop": "wheat",
  "location": "Ludhiana",
  "pestDetection": {
    "pestName": "Brown Planthopper",
    "confidence": 0.85
  }
}
```

**Response:**
```json
{
  "success": true,
  "advisory": {
    "immediateActions": [
      "Monitor wheat crop for weather-related stress",
      "Check soil moisture levels"
    ],
    "longTermStrategy": [
      "Plan irrigation based on forecast"
    ],
    "financialInsight": "Wheat prices are stable. Consider holding harvest if possible."
  },
  "data": {
    "weather": { /* current weather */ },
    "forecast": [ /* 5-day forecast */ ],
    "market": { /* price data */ }
  }
}
```

## Setup Instructions

### 1. Environment Variables
Create `.env` file in the backend directory:

```bash
# Required for advisory system
GEMINI_API_KEY=your_gemini_api_key_here
WEATHER_API_KEY=your_openweather_api_key_here

# Other existing variables...
```

### 2. API Key Setup

#### Google Gemini AI
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `.env` as `GEMINI_API_KEY`

#### OpenWeatherMap
1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for free account
3. Get API key from dashboard
4. Add to `.env` as `WEATHER_API_KEY`

### 3. Frontend Integration
The advisory system is integrated into the main dashboard as the first tab:

```javascript
// Dashboard.js - Smart Advisory is now the default tab
const [activeTab, setActiveTab] = useState('advisory');
```

## How It Works

### 1. Data Collection
When a user requests an advisory:
1. **Weather Data**: Fetches current conditions and 5-day forecast
2. **Market Data**: Gets current crop prices and calculates trends
3. **User Context**: Includes location, selected crop, and pest detection

### 2. AI Processing
The system sends a comprehensive prompt to Gemini AI including:
- All weather and market data
- Crop-specific information
- Regional context
- Pest detection results (if available)

### 3. Response Generation
AI generates structured advice with:
- **Immediate Actions**: Urgent tasks for farmer
- **Long-term Strategy**: Weekly planning advice
- **Financial Insights**: Market-based recommendations

### 4. Fallback Systems
- **Mock Weather Data**: If OpenWeather API fails
- **Simulated Market Prices**: Realistic price generation
- **Fallback Advisory**: Rule-based recommendations if AI fails

## Technical Features

### Error Handling
- Graceful degradation when APIs are unavailable
- User-friendly error messages
- Automatic fallback to mock data

### Performance
- Parallel API calls for faster response
- Cached weather data to reduce API calls
- Optimized frontend rendering

### Security
- JWT token authentication required
- Input validation and sanitization
- API key protection

## Usage Example

1. **Select Crop**: Choose from 8 supported crops
2. **Select Location**: Pick from Punjab districts
3. **Generate Advisory**: Click to get AI recommendations
4. **View Results**: See weather, market, and AI insights
5. **Take Action**: Follow immediate and long-term advice

## Supported Crops

- Wheat (गेहूं / ਕਣਕ)
- Rice (चावल / ਚਾਵਲ)
- Cotton (कपास / ਕਪਾਸ)
- Maize (मक्का / ਮਕਈ)
- Sugarcane (गन्ना / ਗੰਨਾ)
- Soybean (सोयाबीन / ਸੋਇਆਬੀਨ)
- Mustard (सरसों / ਸਰੀਂਹ)
- Potato (आलू / ਆਲੂ)

## Future Enhancements

- **Soil Analysis Integration**: Include soil health data
- **Satellite Imagery**: Crop health monitoring
- **Historical Analysis**: Multi-year trend analysis
- **Push Notifications**: Automated alerts
- **Machine Learning**: Improved recommendation accuracy