# AgroAI Deployment Guide

## 🚀 Quick Deployment Checklist

### Backend Deployment (Render/Heroku)

1. **Set Environment Variables:**
   ```bash
   NODE_ENV=production
   JWT_SECRET=your_secure_random_string_here
   GEMINI_API_KEY=AIzaSyDZrbvQx0912vywuDmjk98gpvPNi6r1nIA
   WEATHER_API_KEY=feb3e27b54a6bca3fb4e187210127271
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

2. **Database Setup:**
   - Create PostgreSQL database
   - Set DATABASE_URL environment variable
   - Tables will be created automatically on first run

3. **Deploy Backend:**
   - Push code to your repository
   - Connect to hosting service (Render/Heroku)
   - Set environment variables
   - Deploy

### Frontend Deployment (Netlify)

1. **Update netlify.toml:**
   ```toml
   [build.environment]
   REACT_APP_API_URL = "https://your-backend-url.onrender.com"
   ```

2. **Deploy Frontend:**
   - Connect repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `build`
   - Set base directory: `client`

### 🔧 Common Issues & Solutions

#### Weather API Not Working
- Ensure `WEATHER_API_KEY` is set in production environment variables
- Check if API key is valid: `feb3e27b54a6bca3fb4e187210127271`

#### AI Chatbot Not Working
- Ensure `GEMINI_API_KEY` is set in production environment variables
- Check API key: `AIzaSyDZrbvQx0912vywuDmjk98gpvPNi6r1nIA`

#### CORS Errors
- Update CORS origins in `server-real.js` to include your frontend URL
- Add your Netlify URL to the `allowedOrigins` array

#### Database Connection Issues
- Ensure `DATABASE_URL` is correctly formatted
- Check PostgreSQL connection and credentials
- For development, SQLite will be used automatically

### 🌐 URLs Configuration

- **Backend Health Check:** `https://your-backend-url/api/health`
- **Weather API Test:** `https://your-backend-url/api/weather/Ludhiana`
- **Frontend:** `https://your-app-name.netlify.app`

### 📝 Environment Variables Summary

| Variable | Required | Purpose |
|----------|----------|---------|
| NODE_ENV | Yes | Set to 'production' |
| JWT_SECRET | Yes | Authentication security |
| GEMINI_API_KEY | Yes | AI chatbot functionality |
| WEATHER_API_KEY | Yes | Real-time weather data |
| DATABASE_URL | Yes | PostgreSQL connection |
| TWILIO_* | No | SMS notifications (optional) |

### ✅ Post-Deployment Testing

1. Visit frontend URL
2. Test language switching
3. Test weather API (should show real data)
4. Test AI chatbot (should respond without errors)
5. Test user registration/login flow

If any features don't work, check the environment variables and ensure all APIs are properly configured.