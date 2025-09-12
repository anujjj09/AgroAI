const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import database
const { sequelize, testConnection } = require('./config/database');

// Import middleware
const { logger, requestLogger, errorLogger } = require('./middleware/logger');
const { generalLimiter, authLimiter, otpLimiter, aiLimiter, uploadLimiter, communityLimiter } = require('./middleware/rateLimiter');
const { validatePagination } = require('./middleware/validation');

const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const weatherRoutes = require('./routes/weather');
const marketRoutes = require('./routes/market');
const aiRoutes = require('./routes/ai');
const communityRoutes = require('./routes/community');
const notificationRoutes = require('./routes/notifications');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      scriptSrc: ["'self'", "https://unpkg.com", "https://cdn.tailwindcss.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.openweathermap.org", "https://generativelanguage.googleapis.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(compression()); // Gzip compression
app.use(morgan('combined', { stream: logger.stream })); // HTTP request logging
app.use(requestLogger); // Custom request logging
app.use(cookieParser());

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL?.split(',') || ['https://yourdomain.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:5500', 'file://', 'null'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Rate limiting - apply different limits to different routes
app.use('/api/', generalLimiter);
app.use('/api/auth/send-otp', otpLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/ai', aiLimiter);
app.use('/api/community', communityLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Database connection and sync
const initializeDatabase = async () => {
  try {
    await testConnection();
    await sequelize.sync({ alter: true }); // Use { force: true } for fresh start
    console.log('✅ Database synchronized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'AgroAI Backend is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Error handling middleware
app.use(errorLogger);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    logger.info(`🚀 AgroAI Backend Server running on port ${PORT}`);
    logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🗄️  Database: PostgreSQL`);
    logger.info(`🌐 Health check: http://localhost:${PORT}/api/health`);
    logger.info(`📊 Rate limiting: ${process.env.RATE_LIMIT_MAX_REQUESTS || 100} requests per ${(process.env.RATE_LIMIT_WINDOW_MS || 900000) / 60000} minutes`);
  });
};

startServer().catch(console.error);

module.exports = app;
