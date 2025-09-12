const rateLimit = require('express-rate-limit');

// General API rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: 900 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts',
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: 900
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: 'Rate limit exceeded for authentication. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Rate limiting for OTP requests (stricter)
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 OTP requests per hour
  message: {
    error: 'Too many OTP requests',
    message: 'Too many OTP requests from this IP, please try again after an hour.',
    retryAfter: 3600
  },
  keyGenerator: (req) => {
    // Rate limit by phone number if available, otherwise by IP
    return req.body.phoneNumber || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many OTP requests',
      message: 'Rate limit exceeded for OTP requests. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Rate limiting for AI/chat endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each user to 50 AI requests per hour
  message: {
    error: 'AI usage limit exceeded',
    message: 'You have exceeded the AI usage limit. Please try again later.',
    retryAfter: 3600
  },
  keyGenerator: (req) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    return req.user?.userId || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'AI usage limit exceeded',
      message: 'AI usage limit exceeded. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Rate limiting for file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each user to 20 uploads per hour
  message: {
    error: 'Upload limit exceeded',
    message: 'Too many file uploads. Please try again later.',
    retryAfter: 3600
  },
  keyGenerator: (req) => {
    return req.user?.userId || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Upload limit exceeded',
      message: 'File upload limit exceeded. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Rate limiting for community posts/comments
const communityLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each user to 30 posts/comments per hour
  message: {
    error: 'Community posting limit exceeded',
    message: 'Too many posts or comments. Please try again later.',
    retryAfter: 3600
  },
  keyGenerator: (req) => {
    return req.user?.userId || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Community posting limit exceeded',
      message: 'Community posting limit exceeded. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  otpLimiter,
  aiLimiter,
  uploadLimiter,
  communityLimiter
};
