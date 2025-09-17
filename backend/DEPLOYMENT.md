# AgroAI Backend Deployment Configuration

## Environment Variables Required for Production:

### Core Configuration
- NODE_ENV=production
- PORT=5000

### Database 
- DATABASE_URL=postgresql://username:password@host:port/database

### Authentication
- JWT_SECRET=your_secure_jwt_secret_here

### AI Services
- GEMINI_API_KEY=AIzaSyDZrbvQx0912vywuDmjk98gpvPNi6r1nIA
- WEATHER_API_KEY=feb3e27b54a6bca3fb4e187210127271

### Optional SMS Service
- TWILIO_ACCOUNT_SID=your_twilio_account_sid (optional)
- TWILIO_AUTH_TOKEN=your_twilio_auth_token (optional)
- TWILIO_PHONE_NUMBER=your_twilio_phone_number (optional)

## Deployment Steps:
1. Set all environment variables in your hosting platform
2. Ensure PostgreSQL database is created and accessible
3. The app will automatically create database tables on first run
4. Frontend should be deployed separately with REACT_APP_API_URL pointing to backend

## Important Notes:
- Never commit .env files to git
- Use secure random strings for JWT_SECRET in production
- Ensure database has proper SSL configuration
- API keys should be kept secure and not exposed in frontend code