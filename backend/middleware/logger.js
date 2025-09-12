const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Add colors to winston
winston.addColors(colors);

// Define custom format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define transports
const transports = [
  // Console transport for development
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/error.log'),
    level: 'error'
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/combined.log')
  })
];

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Morgan stream for HTTP request logging
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// Custom logging methods for different scenarios
logger.logUserAction = (userId, action, details = {}) => {
  logger.info(`User Action: ${action}`, {
    userId,
    action,
    details,
    timestamp: new Date().toISOString()
  });
};

logger.logAPICall = (method, url, statusCode, responseTime, userId = null) => {
  logger.http(`${method} ${url} ${statusCode} - ${responseTime}ms`, {
    method,
    url,
    statusCode,
    responseTime,
    userId,
    timestamp: new Date().toISOString()
  });
};

logger.logError = (error, context = {}) => {
  logger.error(`Error: ${error.message}`, {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    context,
    timestamp: new Date().toISOString()
  });
};

logger.logSecurity = (event, details = {}) => {
  logger.warn(`Security Event: ${event}`, {
    event,
    details,
    timestamp: new Date().toISOString()
  });
};

logger.logDatabase = (operation, collection, details = {}) => {
  logger.debug(`Database: ${operation} on ${collection}`, {
    operation,
    collection,
    details,
    timestamp: new Date().toISOString()
  });
};

logger.logExternalAPI = (service, endpoint, status, responseTime) => {
  logger.info(`External API: ${service} ${endpoint} ${status} - ${responseTime}ms`, {
    service,
    endpoint,
    status,
    responseTime,
    timestamp: new Date().toISOString()
  });
};

// Middleware for request logging
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const userId = req.user?.userId || 'anonymous';
    
    logger.logAPICall(
      req.method,
      req.originalUrl,
      res.statusCode,
      duration,
      userId
    );
  });
  
  next();
};

// Error handling middleware with logging
const errorLogger = (err, req, res, next) => {
  const context = {
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.userId || 'anonymous',
    ip: req.ip,
    userAgent: req.get('User-Agent')
  };
  
  logger.logError(err, context);
  
  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Something went wrong. Please try again later.'
    });
  } else {
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
      stack: err.stack
    });
  }
};

module.exports = {
  logger,
  requestLogger,
  errorLogger
};
