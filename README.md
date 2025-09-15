# AgroAI - Smart Farming Intelligence �

A full-stack agricultural intelligence platform with AI-powered crop advisory, pest detection, weather monitoring, and market insights.

## � Quick Deploy

### Frontend (Netlify)
- **Base directory**: `frontend`
- **Build command**: `echo "Static HTML deployment"`
- **Publish directory**: `frontend`

### Backend (Railway/Render)
- **Root directory**: `backend`
- **Build command**: `npm install`
- **Start command**: `node server-real.js`

## � Project Structure

```
AgroAI/
├── frontend/           # Static HTML frontend
│   ├── index.html     # Main application
│   └── package.json   # Frontend config
├── backend/           # Node.js API server
│   ├── server-real.js # Main server file
│   ├── package.json   # Dependencies
│   └── .env.example   # Environment template
└── README.md          # Documentation
```

## �️ Environment Setup

1. **Backend**: Copy `backend/.env.example` to `backend/.env`
2. **Database**: Set up PostgreSQL and update DB credentials
3. **SMS**: Optional Twilio configuration for real SMS

## �� Live URLs
- **Frontend**: Deploy to Netlify
- **Backend**: Deploy to Railway/Render
- **Database**: Use cloud PostgreSQL (Neon, Supabase, etc.)

## � Features
- � AI Crop Advisory
- � Pest Detection
- �️ Weather Monitoring  
- � Market Prices
- � SMS Authentication
- �️ PostgreSQL Database
