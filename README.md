# AgroAI - Smart Farming Intelligence í¼¾

A full-stack agricultural intelligence platform with AI-powered crop advisory, pest detection, weather monitoring, and market insights.

## íº€ Quick Deploy

### Frontend (Netlify)
- **Base directory**: `frontend`
- **Build command**: `echo "Static HTML deployment"`
- **Publish directory**: `frontend`

### Backend (Railway/Render)
- **Root directory**: `backend`
- **Build command**: `npm install`
- **Start command**: `node server-real.js`

## í³ Project Structure

```
AgroAI/
â”œâ”€â”€ frontend/           # Static HTML frontend
â”‚   â”œâ”€â”€ index.html     # Main application
â”‚   â””â”€â”€ package.json   # Frontend config
â”œâ”€â”€ backend/           # Node.js API server
â”‚   â”œâ”€â”€ server-real.js # Main server file
â”‚   â”œâ”€â”€ package.json   # Dependencies
â”‚   â””â”€â”€ .env.example   # Environment template
â””â”€â”€ README.md          # Documentation
```

## í» ï¸ Environment Setup

1. **Backend**: Copy `backend/.env.example` to `backend/.env`
2. **Database**: Set up PostgreSQL and update DB credentials
3. **SMS**: Optional Twilio configuration for real SMS

## ï¿½ï¿½ Live URLs
- **Frontend**: Deploy to Netlify
- **Backend**: Deploy to Railway/Render
- **Database**: Use cloud PostgreSQL (Neon, Supabase, etc.)

## í´§ Features
- í´– AI Crop Advisory
- í°› Pest Detection
- í¼¤ï¸ Weather Monitoring  
- í³ˆ Market Prices
- í³± SMS Authentication
- í·„ï¸ PostgreSQL Database
