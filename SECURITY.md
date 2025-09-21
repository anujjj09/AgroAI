# 🔐 Security Configuration Guide

## Environment Variables Setup

### 1. Backend Environment (.env)
Create a `.env` file in the `backend/` directory with your actual API keys:

```bash
# Server Configuration
NODE_ENV=development
PORT=5002

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agroai
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Secret (Generate a strong random string)
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here

# API Keys (Get your own from respective services)
GEMINI_API_KEY=your_actual_gemini_api_key
WEATHER_API_KEY=your_actual_weather_api_key

# Optional: Twilio for SMS
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

### 2. Frontend Environment (.env.development.local)
Already exists in `client/` directory - only contains local API URL.

## 🚨 Security Best Practices

### Never Commit:
- Real API keys
- Database passwords
- JWT secrets
- Any `.env` files with actual values

### Always Use:
- `.env.example` files as templates
- Strong, unique passwords
- Environment-specific configurations
- Secure key generation

## 🔑 Getting API Keys

### Google Gemini AI:
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create API key
3. Add to `GEMINI_API_KEY`

### OpenWeatherMap:
1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get free API key
3. Add to `WEATHER_API_KEY`

### PostgreSQL:
1. Install PostgreSQL locally or use cloud service
2. Create database named `agroai`
3. Update connection details

## 🛡️ Additional Security

### For Production:
- Use strong, unique JWT secrets
- Enable HTTPS
- Use environment-specific configurations
- Rotate API keys regularly
- Monitor API usage

### Database Security:
- Use strong passwords
- Enable SSL connections
- Restrict database access
- Regular backups