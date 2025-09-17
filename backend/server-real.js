const express = require('express');
const cors = require('cors');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const fs = require('fs');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Sequelize with PostgreSQL or SQLite for development

const sequelize = process.env.DATABASE_URL ? 
  new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }) :
  new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
  });

// Initialize Google Gemini AI
let genAI = null;
let geminiModel = null;
let geminiVisionModel = null;

if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    geminiVisionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // 1.5 Flash supports both text and vision
    console.log('✅ Google Gemini AI initialized (Text + Vision)');
  } catch (error) {
    console.log('⚠️  Gemini initialization failed:', error.message);
    console.log('🤖 Using AI simulation mode');
  }
} else {
  console.log('⚠️  Gemini API key not configured - using simulation mode');
  console.log('📝 To enable real AI: Set GEMINI_API_KEY in .env file');
}

// Initialize Twilio
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && 
    process.env.TWILIO_AUTH_TOKEN && 
    process.env.TWILIO_ACCOUNT_SID.startsWith('AC') &&
    process.env.TWILIO_AUTH_TOKEN.length > 20) {
  try {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('✅ Twilio SMS service initialized');
  } catch (error) {
    console.log('⚠️  Twilio initialization failed:', error.message);
    console.log('📱 Using SMS simulation mode');
  }
} else {
  console.log('⚠️  Twilio not configured - using simulation mode');
  console.log('📝 To enable real SMS: Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in .env');
}

// Define Models
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  phone_number: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  district: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  preferred_language: {
    type: DataTypes.ENUM('en', 'hi', 'pa'),
    defaultValue: 'en'
  },
  last_login: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

const OTP = sequelize.define('OTP', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  phone_number: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  otp_code: {
    type: DataTypes.STRING(6),
    allowNull: false
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  is_used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

// Middleware - Configure CORS for both development and production
const allowedOrigins = [
  'http://localhost:3000', 
  'http://localhost:3001', 
  'http://127.0.0.1:5500', 
  'file://',
  'https://agro-ai-app.netlify.app',  // Production Netlify URL
  'https://agroai-punjab.netlify.app'  // Alternative URL if needed
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, '../')));

// Authentication middleware - flexible for testing
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Allow guest access for testing - create a default user context
  if (!token) {
    req.user = { 
      userId: 'guest', 
      guest: true,
      district: 'Punjab',
      language: 'en'
    };
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      // On token error, still allow guest access
      req.user = { 
        userId: 'guest', 
        guest: true,
        district: 'Punjab',
        language: 'en'
      };
      return next();
    }
    req.user = user;
    next();
  });
};

// Utility Functions
function generateOTP() {
  // In simulation mode, always return 123456
  if (!twilioClient) {
    return '123456';
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendSMS(phoneNumber, message) {
  if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const result = await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      console.log(`SMS sent to ${phoneNumber}: ${result.sid}`);
      return { success: true, sid: result.sid };
    } catch (error) {
      console.error('SMS Error:', error);
      throw new Error('Failed to send SMS: ' + error.message);
    }
  } else {
    // Simulation mode
    console.log(`📱 SMS Simulation to ${phoneNumber}: ${message}`);
    return { success: true, simulation: true };
  }
}

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      status: 'OK',
      message: 'AgroAI PERN Stack Server with Real Database',
      timestamp: new Date().toISOString(),
      database: 'Connected',
      sms: twilioClient ? 'Real Twilio' : 'Simulation Mode'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Simple test endpoint for debugging API connectivity
app.post('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API connection test successful',
    timestamp: new Date().toISOString(),
    received: req.body
  });
});

// Test endpoint for debugging
app.post('/api/test-chat', async (req, res) => {
  try {
    const { message } = req.body;
    res.status(200).json({
      success: true,
      response: `Test response for: ${message}`,
      timestamp: new Date().toISOString(),
      geminiAI: geminiModel ? 'Available' : 'Not Available'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Test endpoint error',
      message: error.message
    });
  }
});

// Authentication Routes
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Validate phone number - allow any format with 10+ digits
    if (!phoneNumber || phoneNumber.length < 10) {
      return res.status(400).json({
        error: 'Invalid phone number',
        message: 'Please provide a valid phone number with at least 10 digits'
      });
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phoneNumber.replace(/[\s-()]/g, '');

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete existing OTPs for this phone number
    await OTP.destroy({
      where: { phone_number: cleanPhone, is_used: false }
    });

    // Create new OTP record
    await OTP.create({
      phone_number: cleanPhone,
      otp_code: otpCode,
      expires_at: expiresAt
    });

    // Send SMS
    const message = `Your AgroAI verification code is: ${otpCode}. Valid for 10 minutes.`;
    const smsResult = await sendSMS(cleanPhone, message);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      phoneNumber: cleanPhone,
      simulation: smsResult.simulation || false
    });

  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({
      error: 'Failed to send OTP',
      message: error.message
    });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Phone number and OTP are required'
      });
    }

    const cleanPhone = phoneNumber.replace(/[\s-()]/g, '');

    // Find valid OTP
    const otpRecord = await OTP.findOne({
      where: {
        phone_number: cleanPhone,
        otp_code: otp,
        is_used: false,
        expires_at: {
          [Sequelize.Op.gt]: new Date()
        }
      }
    });

    if (!otpRecord) {
      // Increment attempts for existing OTP
      await OTP.increment('attempts', {
        where: { phone_number: cleanPhone, is_used: false }
      });

      return res.status(400).json({
        error: 'Invalid OTP',
        message: 'OTP is invalid or has expired'
      });
    }

    // Mark OTP as used
    await otpRecord.update({ is_used: true });

    // Find or create user
    let user = await User.findOne({
      where: { phone_number: cleanPhone }
    });

    if (!user) {
      user = await User.create({
        phone_number: cleanPhone,
        is_verified: true,
        last_login: new Date()
      });
    } else {
      await user.update({
        is_verified: true,
        last_login: new Date()
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        phoneNumber: user.phone_number,
        isVerified: user.is_verified
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        id: user.id,
        phoneNumber: user.phone_number,
        name: user.name,
        district: user.district,
        language: user.preferred_language,
        isVerified: user.is_verified
      }
    });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: error.message
    });
  }
});

// User Profile Routes
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        phoneNumber: user.phone_number,
        name: user.name,
        district: user.district,
        language: user.preferred_language,
        isVerified: user.is_verified,
        lastLogin: user.last_login
      }
    });
  } catch (error) {
    console.error('Profile Error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      message: error.message
    });
  }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { name, district, language } = req.body;
    
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (district) updates.district = district;
    if (language) updates.preferred_language = language;

    await user.update(updates);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        phoneNumber: user.phone_number,
        name: user.name,
        district: user.district,
        language: user.preferred_language,
        isVerified: user.is_verified
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message
    });
  }
});

// Language preference update endpoint
app.post('/api/user/language', authenticateToken, async (req, res) => {
  try {
    const { language } = req.body;
    
    if (!['en', 'hi', 'pa'].includes(language)) {
      return res.status(400).json({
        error: 'Invalid language',
        message: 'Supported languages: en, hi, pa'
      });
    }

    // For authenticated users, update database
    if (req.user && !req.user.guest) {
      const user = await User.findByPk(req.user.userId);
      if (user) {
        await user.update({ preferred_language: language });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Language preference updated',
      language: language
    });

  } catch (error) {
    console.error('Update Language Error:', error);
    res.status(500).json({
      error: 'Language update failed',
      message: error.message
    });
  }
});

// Weather API (using OpenWeatherMap API)
app.get('/api/weather/:district', async (req, res) => {
  try {
    const { district } = req.params;
    const weatherApiKey = process.env.WEATHER_API_KEY;
    
    if (!weatherApiKey) {
      // Fallback to mock data if no API key
      const weatherData = {
        district,
        temperature: Math.round(Math.random() * 20 + 15),
        humidity: Math.round(Math.random() * 40 + 40),
        windSpeed: Math.round(Math.random() * 10 + 5),
        description: 'Clear sky',
        icon: '01d',
        timestamp: new Date().toISOString()
      };
      
      return res.status(200).json({
        success: true,
        weather: weatherData
      });
    }

    // Call OpenWeatherMap API
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${district},IN&appid=${weatherApiKey}&units=metric`;
    
    const response = await fetch(weatherUrl);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Weather API error');
    }

    const weatherData = {
      district,
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json({
      success: true,
      weather: weatherData
    });
  } catch (error) {
    console.error('Weather API error:', error);
    
    // Fallback to mock data on error
    const { district } = req.params;
    const weatherData = {
      district,
      temperature: Math.round(Math.random() * 20 + 15),
      humidity: Math.round(Math.random() * 40 + 40),
      windSpeed: Math.round(Math.random() * 10 + 5),
      description: 'Clear sky',
      icon: '01d',
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json({
      success: true,
      weather: weatherData,
      note: 'Using fallback data due to API unavailability'
    });
  }
});

// Market API
app.get('/api/market/:district', async (req, res) => {
  try {
    const { district } = req.params;
    
    const mockPrices = [
      { commodity: 'Wheat', price: Math.round(Math.random() * 500 + 2000), unit: 'per quintal', change: Math.round((Math.random() - 0.5) * 200) },
      { commodity: 'Rice', price: Math.round(Math.random() * 800 + 2500), unit: 'per quintal', change: Math.round((Math.random() - 0.5) * 300) },
      { commodity: 'Cotton', price: Math.round(Math.random() * 1000 + 4000), unit: 'per quintal', change: Math.round((Math.random() - 0.5) * 500) },
      { commodity: 'Maize', price: Math.round(Math.random() * 300 + 1500), unit: 'per quintal', change: Math.round((Math.random() - 0.5) * 150) }
    ];
    
    res.status(200).json({
      success: true,
      district,
      prices: mockPrices,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Market service error',
      message: error.message
    });
  }
});

// AI Chat - Intelligent Agricultural Assistant
app.post('/api/ai/chat', authenticateToken, async (req, res) => {
  try {
    const { message, userContext } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required',
        message: 'Please provide a message for the AI assistant'
      });
    }
    
    // Get user context from authenticated user or request
    let district = 'Punjab';
    let language = 'en';
    
    if (req.user && !req.user.guest) {
      const user = await User.findByPk(req.user.userId);
      district = user?.district || userContext?.district || 'Punjab';
      language = user?.preferred_language || userContext?.language || 'en';
    } else {
      // Guest user or no authentication - use request context
      district = userContext?.district || req.user?.district || 'Punjab';
      language = userContext?.language || req.user?.language || 'en';
    }
    
    let response;
    
    // Try to use Gemini AI first
    console.log('🔍 Checking Gemini model availability:', !!geminiModel);
    console.log('🔍 User message:', message);
    console.log('🔍 Language:', language);
    if (geminiModel) {
      try {
        let prompt;
        
        if (language === 'hi') {
          prompt = `आप एक सहायक AI असिस्टेंट हैं। उपयोगकर्ता ${district} जिले से है।

उपयोगकर्ता का प्रश्न: ${message}

कृपया हिंदी में सहायक और सटीक जवाब दें:`;
        } else if (language === 'pa') {
          prompt = `ਤੁਸੀਂ ਇੱਕ ਸਹਾਇਕ AI ਅਸਿਸਟੈਂਟ ਹੋ। ਉਪਭੋਗਤਾ ${district} ਜ਼ਿਲ੍ਹੇ ਦਾ ਹੈ।

ਉਪਭੋਗਤਾ ਦਾ ਸਵਾਲ: ${message}

ਕਿਰਪਾ ਕਰਕੇ ਪੰਜਾਬੀ ਵਿੱਚ ਸਹਾਇਕ ਅਤੇ ਸਹੀ ਜਵਾਬ ਦਿਓ:`;
        } else {
          prompt = `You are a helpful AI assistant. The user is from ${district} district.

User question: ${message}

Please provide a helpful and accurate response:`;
        }

        console.log('🤖 Calling Gemini API with prompt length:', prompt.length);
        const result = await geminiModel.generateContent(prompt);
        const aiResponse = result.response;
        response = aiResponse.text();
        
        console.log('✅ Gemini API success! Response length:', response.length);
        console.log('✅ First 200 chars:', response.substring(0, 200));
        
        // Clean up the response
        response = response.replace(/\*\*/g, '').trim();
        
      } catch (geminiError) {
        console.error('❌ Gemini API failed:', geminiError.message);
        console.error('❌ Error details:', geminiError);
        console.log('🔄 Falling back to intelligent response system');
        response = `I'm having trouble connecting to my AI service right now. Let me help you with a general response: ${generateIntelligentResponse(message.toLowerCase().trim(), district, language)}`;
      }
    } else {
      // Use fallback response system
      response = generateIntelligentResponse(message.toLowerCase().trim(), district, language);
    }
    
    res.status(200).json({
      success: true,
      response: response,
      timestamp: new Date().toISOString(),
      context: {
        district: district,
        language: language,
        aiSource: geminiModel ? 'gemini' : 'fallback'
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'AI service error',
      message: error.message
    });
  }
});

// Intelligent response generation function
function generateIntelligentResponse(userMessage, district, language) {
  const msg = userMessage.toLowerCase();
  
  // Weather-related responses in different languages
  if (msg.includes('weather') || msg.includes('rain') || msg.includes('मौसम') || msg.includes('बारिश') || msg.includes('ਮੌਸਮ') || msg.includes('ਬਰਸਾਤ')) {
    if (language === 'hi') {
      return `${district} में वर्तमान मौसम पैटर्न के आधार पर, मैं मिट्टी की नमी के स्तर की निगरानी करने और तदनुसार सिंचाई को समायोजित करने की सिफारिश करता हूं। मौसम पूर्वानुमान की जांच करें।`;
    } else if (language === 'pa') {
      return `${district} ਵਿੱਚ ਮੌਜੂਦਾ ਮੌਸਮ ਪੈਟਰਨ ਦੇ ਆਧਾਰ 'ਤੇ, ਮੈਂ ਮਿੱਟੀ ਦੀ ਨਮੀ ਦੇ ਪੱਧਰ ਦੀ ਨਿਗਰਾਨੀ ਕਰਨ ਅਤੇ ਸਿੰਚਾਈ ਨੂੰ ਉਸ ਅਨੁਸਾਰ ਵਿਵਸਥਿਤ ਕਰਨ ਦੀ ਸਿਫਾਰਸ਼ ਕਰਦਾ ਹਾਂ। ਮੌਸਮ ਪੂਰਵਾਨੁਮਾਨ ਦੀ ਜਾਂਚ ਕਰੋ।`;
    }
    return `Based on current weather patterns in ${district}, I recommend monitoring soil moisture levels and adjusting irrigation accordingly. Check weather forecasts before planning field activities.`;
  }
  
  // Wheat cultivation
  if (msg.includes('wheat') || msg.includes('गेहूं') || msg.includes('ਕਣਕ')) {
    if (language === 'hi') {
      return `${district} में गेहूं की खेती के लिए: नवंबर-दिसंबर में बुवाई करें, उचित बीज उपचार सुनिश्चित करें, संतुलित उर्वरक (120kg N, 60kg P2O5, 40kg K2O प्रति हेक्टेयर) लगाएं। अप्रैल-मई में कटाई करें।`;
    } else if (language === 'pa') {
      return `${district} ਵਿੱਚ ਕਣਕ ਦੀ ਖੇਤੀ ਲਈ: ਨਵੰਬਰ-ਦਸੰਬਰ ਵਿੱਚ ਬੀਜਾਈ ਕਰੋ, ਸਹੀ ਬੀਜ ਇਲਾਜ ਯਕੀਨੀ ਬਣਾਓ, ਸੰਤੁਲਿਤ ਖਾਦ (120kg N, 60kg P2O5, 40kg K2O ਪ੍ਰਤੀ ਹੈਕਟੇਅਰ) ਪਾਓ। ਅਪ੍ਰੈਲ-ਮਈ ਵਿੱਚ ਕਟਾਈ ਕਰੋ।`;
    }
    return `For wheat cultivation in ${district}: Plant in November-December, ensure proper seed treatment, apply balanced fertilizers (120kg N, 60kg P2O5, 40kg K2O per hectare), and maintain adequate moisture. Harvest in April-May.`;
  }
  
  // Rice cultivation  
  if (msg.includes('rice') || msg.includes('paddy') || msg.includes('धान') || msg.includes('चावल') || msg.includes('ਧਾਨ') || msg.includes('ਚਾਵਲ')) {
    if (language === 'hi') {
      return `${district} में धान की खेती: जून में रोपाई करें, पानी की उचित व्यवस्था बनाए रखें (2-5 सेमी), संतुलित उर्वरक का उपयोग करें। भूरे फुदके और तना छेदक से सावधान रहें।`;
    } else if (language === 'pa') {
      return `${district} ਵਿੱਚ ਧਾਨ ਦੀ ਖੇਤੀ: ਜੂਨ ਵਿੱਚ ਰੋਪਾਈ ਕਰੋ, ਪਾਣੀ ਦੀ ਸਹੀ ਵਿਵਸਥਾ (2-5 ਸੈਮੀ) ਰੱਖੋ, ਸੰਤੁਲਿਤ ਖਾਦ ਦਾ ਇਸਤੇਮਾਲ ਕਰੋ। ਭੂਰੇ ਫੁਦਕੇ ਅਤੇ ਤਣਾ ਛੇਦਕ ਤੋਂ ਸਾਵਧਾਨ ਰਹੋ।`;
    }
    return `For rice cultivation in ${district}: Transplant in June, maintain proper water level (2-5cm), use balanced fertilizers. Watch out for brown planthopper and stem borer.`;
  }
  
  // Cotton cultivation  
  if (msg.includes('cotton') || msg.includes('कपास') || msg.includes('ਕਪਾਹ')) {
    if (language === 'hi') {
      return `${district} में कपास की खेती: अप्रैल-मई में बुवाई करें, 67.5cm x 23cm की दूरी बनाए रखें, बुवाई के समय पर्याप्त फॉस्फोरस डालें। सूंडी और सफेद मक्खी की निगरानी करें।`;
    } else if (language === 'pa') {
      return `${district} ਵਿੱਚ ਕਪਾਹ ਦੀ ਖੇਤੀ: ਅਪ੍ਰੈਲ-ਮਈ ਵਿੱਚ ਬੀਜਾਈ ਕਰੋ, 67.5cm x 23cm ਦੀ ਦੂਰੀ ਰੱਖੋ, ਬੀਜਾਈ ਸਮੇਂ ਲੋੜੀਂਦਾ ਫਾਸਫੋਰਸ ਪਾਓ। ਸੁੰਡੀ ਅਤੇ ਚਿੱਟੇ ਮੱਖੀ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ।`;
    }
    return `Cotton cultivation in ${district}: Sow in April-May, maintain plant spacing of 67.5cm x 23cm, apply adequate phosphorus at planting, monitor for bollworm and whitefly. Pick cotton when bolls are fully opened.`;
  }
  
  // Pest and disease responses with multilingual support
  if (msg.includes('pest') || msg.includes('कीट') || msg.includes('ਕੀੜੇ') || msg.includes('disease') || msg.includes('बीमारी') || msg.includes('ਬਿਮਾਰੀ')) {
    if (language === 'hi') {
      return `${district} में कीट प्रबंधन के लिए एकीकृत कीट प्रबंधन (IPM) का उपयोग करें - जैविक नियंत्रण, प्रतिरोधी किस्मों, और कीटनाशकों का सुविचारित उपयोग। नीम आधारित उत्पादों का उपयोग करें।`;
    } else if (language === 'pa') {
      return `${district} ਵਿੱਚ ਕੀੜੇ ਪ੍ਰਬੰਧਨ ਲਈ ਏਕੀਕ੍ਰਿਤ ਕੀੜੇ ਪ੍ਰਬੰਧਨ (IPM) ਦੀ ਵਰਤੋਂ ਕਰੋ - ਜੀਵ ਵਿਗਿਆਨਕ ਨਿਯੰਤਰਣ, ਪ੍ਰਤੀਰੋਧੀ ਕਿਸਮਾਂ, ਅਤੇ ਕੀੜੇ-ਮਾਰ ਦਵਾਈਆਂ ਦੀ ਸੋਚੀ-ਸਮਝੀ ਵਰਤੋਂ। ਨਿੰਮ ਅਧਾਰਤ ਉਤਪਾਦਾਂ ਦੀ ਵਰਤੋਂ ਕਰੋ।`;
    }
    return `For pest management in ${district}, use Integrated Pest Management (IPM) - combine biological controls, resistant varieties, and judicious use of pesticides. Use neem-based products for organic control.`;
  }
  
  if (msg.includes('maize') || msg.includes('corn') || msg.includes('makka')) {
    return `Maize growing tips for ${district}: Plant after soil temperature reaches 15°C, ensure proper drainage, apply 150kg N + 75kg P2O5 + 40kg K2O per hectare. Watch for fall armyworm and stem borer.`;
  }
  
  if (msg.includes('sugarcane') || msg.includes('ganna')) {
    return `Sugarcane cultivation in ${district}: Plant in February-March or October-November, use healthy setts, apply 300kg N + 125kg P2O5 + 125kg K2O per hectare in splits. Harvest after 12-14 months.`;
  }
  
  // Fertilizer and nutrient queries
  if (msg.includes('fertilizer') || msg.includes('urea') || msg.includes('nutrient') || msg.includes('nitrogen') || msg.includes('phosphorus')) {
    const fertilizerResponses = [
      `For balanced nutrition in ${district}, use soil testing to determine exact fertilizer needs. Generally apply NPK in 4:2:1 ratio for most crops.`,
      `Organic fertilizers like FYM and compost improve soil health in ${district}. Apply 10-15 tonnes per hectare before sowing.`,
      `Micronutrients like zinc and iron are often deficient in ${district} soils. Consider foliar application of micronutrient mix.`,
      `Proper fertilizer timing is crucial - apply phosphorus at sowing, nitrogen in splits, and potassium as per crop requirements.`
    ];
    return fertilizerResponses[Math.floor(Math.random() * fertilizerResponses.length)];
  }
  
  // Pest and disease queries
  if (msg.includes('pest') || msg.includes('insect') || msg.includes('disease') || msg.includes('bug') || msg.includes('aphid') || msg.includes('borer')) {
    const pestResponses = [
      `For pest management in ${district}, use Integrated Pest Management (IPM) - combine biological controls, resistant varieties, and judicious use of pesticides.`,
      `Monitor your crops weekly for pest damage. Early detection is key. Use yellow sticky traps for flying insects and pheromone traps for moths.`,
      `Common pests in ${district} include aphids, bollworms, and stem borers. Use neem-based products for organic control or consult with agricultural extension officer.`,
      `Disease management: Ensure proper crop rotation, use certified seeds, maintain field hygiene, and apply fungicides only when necessary.`
    ];
    return pestResponses[Math.floor(Math.random() * pestResponses.length)];
  }
  
  // Irrigation and water management
  if (msg.includes('irrigation') || msg.includes('water') || msg.includes('drought') || msg.includes('moisture')) {
    const irrigationResponses = [
      `Efficient irrigation in ${district}: Use drip or sprinkler systems to save water. Apply water at critical growth stages like flowering and grain filling.`,
      `Water management is crucial in ${district}. Monitor soil moisture at 15cm depth. Generally, irrigate when soil moisture drops to 70% of field capacity.`,
      `Consider water harvesting techniques like farm ponds and check dams. Mulching helps retain soil moisture and reduce irrigation frequency.`,
      `Proper drainage is as important as irrigation in ${district}. Ensure fields don't get waterlogged during monsoon season.`
    ];
    return irrigationResponses[Math.floor(Math.random() * irrigationResponses.length)];
  }
  
  // Soil health queries
  if (msg.includes('soil') || msg.includes('ph') || msg.includes('organic matter') || msg.includes('erosion')) {
    const soilResponses = [
      `Soil health in ${district}: Test soil pH annually. Most crops prefer pH 6.0-7.5. Add lime if too acidic or gypsum if too alkaline.`,
      `Improve soil organic matter by adding compost, green manures, and crop residues. This enhances water retention and nutrient availability.`,
      `Prevent soil erosion in ${district} through contour farming, terracing, and maintaining vegetative cover. Avoid over-tillage.`,
      `Regular soil testing helps optimize fertilizer use. Test for NPK, micronutrients, pH, and organic carbon every 2-3 years.`
    ];
    return soilResponses[Math.floor(Math.random() * soilResponses.length)];
  }
  
  // Market and price queries
  if (msg.includes('price') || msg.includes('market') || msg.includes('sell') || msg.includes('msp') || msg.includes('procurement')) {
    const marketResponses = [
      `Market prices in ${district} vary seasonally. Check local mandi rates regularly. Consider value addition and direct marketing for better prices.`,
      `MSP (Minimum Support Price) is announced by government annually. Register with local procurement agencies to sell at MSP rates.`,
      `Timing of sale is crucial for better prices in ${district}. Store produce properly to avoid post-harvest losses and get better rates.`,
      `Explore farmer producer organizations (FPOs) in ${district} for collective bargaining and better market access.`
    ];
    return marketResponses[Math.floor(Math.random() * marketResponses.length)];
  }
  
  // Machinery and equipment
  if (msg.includes('tractor') || msg.includes('machine') || msg.includes('equipment') || msg.includes('harvest') || msg.includes('planting')) {
    const machineryResponses = [
      `Farm mechanization in ${district}: Use appropriate machinery for different operations. Rent equipment through custom hiring centers if purchase isn't viable.`,
      `Proper maintenance of farm equipment increases efficiency. Clean and service machines regularly, especially before and after crop seasons.`,
      `Consider precision farming tools like GPS-guided tractors and variable rate applicators for efficient input use in ${district}.`,
      `Harvesting at right time is crucial. Use combine harvesters for cereals and ensure proper grain moisture before storage.`
    ];
    return machineryResponses[Math.floor(Math.random() * machineryResponses.length)];
  }
  
  // Financial and subsidy queries
  if (msg.includes('loan') || msg.includes('subsidy') || msg.includes('insurance') || msg.includes('credit') || msg.includes('scheme')) {
    const financialResponses = [
      `Agricultural loans in ${district}: Approach cooperative banks, regional rural banks, or commercial banks. Maintain good credit history for easy access.`,
      `Crop insurance protects against weather risks. Enroll in Pradhan Mantri Fasal Bima Yojana (PMFBY) for comprehensive coverage.`,
      `Government subsidies are available for seeds, fertilizers, and farm equipment in ${district}. Contact local agriculture department for details.`,
      `KCC (Kisan Credit Card) provides flexible credit for farming needs. Apply through banks with required documents and land records.`
    ];
    return financialResponses[Math.floor(Math.random() * financialResponses.length)];
  }
  
  // General farming queries
  if (msg.includes('farming') || msg.includes('agriculture') || msg.includes('crop') || msg.includes('cultivation')) {
    const generalResponses = [
      `Successful farming in ${district} requires proper planning, soil management, timely operations, and market linkages. Focus on sustainable practices.`,
      `Crop diversification reduces risks in ${district}. Grow a mix of cereals, legumes, and cash crops based on local conditions and market demand.`,
      `Extension services in ${district} provide valuable guidance. Attend farmer training programs and demonstrations organized by agriculture department.`,
      `Keep farm records for better decision-making. Track expenses, yields, and profits to identify profitable crops and practices for ${district}.`
    ];
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  }
  
  // Technology and innovation queries  
  if (msg.includes('technology') || msg.includes('app') || msg.includes('digital') || msg.includes('smart farming')) {
    const techResponses = [
      `Digital farming in ${district}: Use weather apps, soil health cards, and market price apps for informed decision-making.`,
      `Precision agriculture technologies like drones and sensors can optimize input use and increase productivity in ${district}.`,
      `Mobile apps help access real-time information on weather, markets, and advisory services. Stay connected with agricultural innovations.`,
      `Smart farming techniques include automated irrigation, GPS guidance, and data-driven crop management for efficient farming in ${district}.`
    ];
    return techResponses[Math.floor(Math.random() * techResponses.length)];
  }
  
  // Greeting responses
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('namaste')) {
    return `Hello! I'm your AI farming assistant for ${district}. I can help you with crop cultivation, pest management, irrigation, fertilizers, market prices, and general farming advice. What would you like to know?`;
  }
  
  if (msg.includes('help') || msg.includes('what can you do')) {
    return `I can assist you with: 🌾 Crop cultivation advice 🐛 Pest & disease management 💧 Irrigation guidance 🧪 Fertilizer recommendations 📈 Market information 🚜 Farm machinery advice 💰 Financial schemes. Ask me anything about farming in ${district}!`;
  }
  
  // Default multilingual response for unrecognized queries
  if (language === 'hi') {
    const hindiResponses = [
      `मैं समझ गया हूं कि आप "${userMessage}" के बारे में पूछ रहे हैं। ${district} में विशिष्ट कृषि मार्गदर्शन के लिए, मैं आपके स्थानीय कृषि विस्तार अधिकारी से सलाह लेने या निकटतम कृषि विज्ञान केंद्र जाने की सिफारिश करता हूं।`,
      `"${userMessage}" के बारे में यह एक दिलचस्प प्रश्न है। जबकि मैं ${district} के लिए सामान्य कृषि सलाह प्रदान कर सकता हूं, विस्तृत तकनीकी मार्गदर्शन के लिए कृपया अपने क्षेत्र के कृषि विशेषज्ञों से संपर्क करें।`,
      `"${userMessage}" के बारे में आपके प्रश्न के लिए धन्यवाद। ${district} में आपकी विशिष्ट स्थिति के लिए सबसे सटीक सलाह के लिए, मैं स्थानीय कृषि विशेषज्ञों या कृषि वैज्ञानिकों से बात करने का सुझाव देता हूं।`
    ];
    return hindiResponses[Math.floor(Math.random() * hindiResponses.length)];
  } else if (language === 'pa') {
    const punjabiResponses = [
      `ਮੈਂ ਸਮਝ ਗਿਆ ਹਾਂ ਕਿ ਤੁਸੀਂ "${userMessage}" ਬਾਰੇ ਪੁੱਛ ਰਹੇ ਹੋ। ${district} ਵਿੱਚ ਵਿਸ਼ੇਸ਼ ਖੇਤੀ ਮਾਰਗਦਰਸ਼ਨ ਲਈ, ਮੈਂ ਤੁਹਾਡੇ ਸਥਾਨਕ ਖੇਤੀ ਵਿਸਥਾਰ ਅਧਿਕਾਰੀ ਨਾਲ ਸਲਾਹ ਕਰਨ ਜਾਂ ਨੇੜਲੇ ਕਿਰਸ਼ੀ ਵਿਗਿਆਨ ਕੇਂਦਰ ਜਾਣ ਦੀ ਸਿਫਾਰਸ਼ ਕਰਦਾ ਹਾਂ।`,
      `"${userMessage}" ਬਾਰੇ ਇਹ ਇੱਕ ਦਿਲਚਸਪ ਸਵਾਲ ਹੈ। ਜਦੋਂ ਕਿ ਮੈਂ ${district} ਲਈ ਆਮ ਖੇਤੀ ਸਲਾਹ ਪ੍ਰਦਾਨ ਕਰ ਸਕਦਾ ਹਾਂ, ਵਿਸਤ੍ਰਿਤ ਤਕਨੀਕੀ ਮਾਰਗਦਰਸ਼ਨ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਖੇਤਰ ਦੇ ਖੇਤੀ ਮਾਹਿਰਾਂ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।`,
      `"${userMessage}" ਬਾਰੇ ਤੁਹਾਡੇ ਸਵਾਲ ਲਈ ਧੰਨਵਾਦ। ${district} ਵਿੱਚ ਤੁਹਾਡੀ ਵਿਸ਼ੇਸ਼ ਸਥਿਤੀ ਲਈ ਸਭ ਤੋਂ ਸਟੀਕ ਸਲਾਹ ਲਈ, ਮੈਂ ਸਥਾਨਕ ਖੇਤੀ ਮਾਹਿਰਾਂ ਜਾਂ ਖੇਤੀ ਵਿਗਿਆਨੀਆਂ ਨਾਲ ਗੱਲ ਕਰਨ ਦਾ ਸੁਝਾਅ ਦਿੰਦਾ ਹਾਂ।`
    ];
    return punjabiResponses[Math.floor(Math.random() * punjabiResponses.length)];
  } else {
    const englishResponses = [
      `I understand you're asking about "${userMessage}". For specific agricultural guidance in ${district}, I recommend consulting with your local agricultural extension officer or visiting the nearest Krishi Vigyan Kendra.`,
      `That's an interesting question about "${userMessage}". While I can provide general farming advice for ${district}, for detailed technical guidance, please contact agricultural experts in your area.`,
      `Thanks for your question about "${userMessage}". For the most accurate advice for your specific situation in ${district}, I suggest speaking with local farming experts or agricultural scientists.`,
      `I'd be happy to help with your farming questions in ${district}. Could you be more specific about crops, pests, irrigation, fertilizers, or other farming aspects you'd like to know about?`
    ];
    return englishResponses[Math.floor(Math.random() * englishResponses.length)];
  }
}

// Pest Detection with Image Analysis using Gemini Vision
app.post('/api/detect-pest', upload.single('image'), authenticateToken, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file provided',
        message: 'Please upload an image for pest detection'
      });
    }

    let district = 'Punjab';
    
    if (req.user && !req.user.guest) {
      const user = await User.findByPk(req.user.userId);
      district = user?.district || req.body.userDistrict || 'Punjab';
    } else {
      district = req.body.userDistrict || req.user?.district || 'Punjab';
    }
    
    let result;

    // Try to use Gemini Vision for real image analysis
    if (geminiVisionModel) {
      try {
        // Convert image buffer to base64
        const imageBase64 = req.file.buffer.toString('base64');
        
        const prompt = `You are an expert agricultural pathologist. Analyze this crop image carefully and identify any pests, diseases, or issues.

IMPORTANT: Respond in this EXACT format:
Pest/Disease Name: [specific name or "Healthy Plant" if no issues]
Confidence: [number between 1-100]
Severity: [Low/Moderate/High/Critical]
Description: [detailed description of what you see]
Treatment: [specific treatment advice]

Look for:
- Insects: aphids, caterpillars, beetles, hoppers
- Diseases: spots, wilting, discoloration, mold
- Nutrient issues: yellowing, stunting, leaf burn
- Physical damage: holes, tears, browning

If the image shows a healthy plant, say so clearly. If unclear or not a plant image, mention that.`;

        const imagePart = {
          inlineData: {
            data: imageBase64,
            mimeType: req.file.mimetype
          }
        };

        const geminiResult = await geminiVisionModel.generateContent([prompt, imagePart]);
        const response = geminiResult.response;
        const analysis = response.text();

        // Parse the AI response to extract structured data
        result = parseGeminiPestResponse(analysis, district);

      } catch (geminiError) {
        console.log('Gemini Vision failed, using fallback:', geminiError.message);
        result = getFallbackPestDetection(district);
      }
    } else {
      // Use fallback detection
      result = getFallbackPestDetection(district);
    }

    res.status(200).json({
      success: true,
      pestName: result.pestName,
      confidence: result.confidence,
      severity: result.severity,
      description: result.description,
      treatment: result.treatment,
      symptoms: result.symptoms,
      cropAffected: result.cropAffected,
      season: result.season,
      aiSource: geminiVisionModel ? 'gemini-vision' : 'fallback'
    });

  } catch (error) {
    console.error('Pest detection error:', error);
    res.status(500).json({
      error: 'Pest detection failed',
      message: error.message
    });
  }
});

// Helper function to parse Gemini response
function parseGeminiPestResponse(analysis, district) {
  console.log('🔍 Raw Gemini analysis:', analysis);
  
  const lines = analysis.split('\n');
  let pestName = 'Unknown Issue';
  let confidence = 0.75;
  let severity = 'Moderate';
  let description = 'Image analysis completed';
  let treatment = 'Consult with local agricultural expert';

  // Extract structured information from AI response
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.includes('Pest/Disease Name:')) {
      pestName = trimmedLine.split('Pest/Disease Name:')[1]?.trim() || pestName;
    }
    if (trimmedLine.includes('Confidence:')) {
      const conf = trimmedLine.split('Confidence:')[1]?.trim();
      const confNum = parseFloat(conf.replace('%', ''));
      if (!isNaN(confNum)) {
        confidence = confNum / 100;
      }
    }
    if (trimmedLine.includes('Severity:')) {
      severity = trimmedLine.split('Severity:')[1]?.trim() || severity;
    }
    if (trimmedLine.includes('Description:')) {
      description = trimmedLine.split('Description:')[1]?.trim() || description;
    }
    if (trimmedLine.includes('Treatment:')) {
      treatment = trimmedLine.split('Treatment:')[1]?.trim() || treatment;
    }
  }

  // Generate symptoms based on the description
  const symptoms = [];
  if (description.toLowerCase().includes('yellow')) symptoms.push('Yellowing of leaves');
  if (description.toLowerCase().includes('spot')) symptoms.push('Spots on foliage');
  if (description.toLowerCase().includes('wilt')) symptoms.push('Wilting symptoms');
  if (description.toLowerCase().includes('hole')) symptoms.push('Holes in leaves');
  if (symptoms.length === 0) symptoms.push('Visual analysis completed');

  console.log('✅ Parsed result:', { pestName, confidence, severity, description: description.substring(0, 100) });

  return {
    pestName,
    confidence,
    severity,
    description,
    treatment,
    symptoms,
    cropAffected: `Analyzed crop in ${district}`,
    season: 'Real-time analysis'
  };
}

// Fallback pest detection function
function getFallbackPestDetection(district) {
  // This function should only be called when Gemini Vision fails
  // Return a message indicating the AI analysis is unavailable
  return {
    pestName: 'Image Analysis Unavailable',
    confidence: 0.0,
    severity: 'Unknown',
    description: 'AI image analysis is currently unavailable. Please ensure you uploaded a clear image of your crop showing any symptoms.',
    treatment: 'For accurate pest identification, please consult with local agricultural experts or visit your nearest Krishi Vigyan Kendra.',
    symptoms: ['Clear image required', 'Upload a focused crop image', 'Ensure good lighting conditions'],
    cropAffected: `General crops in ${district}`,
    season: 'Image analysis needed'
  };
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'AgroAI Backend',
    version: '1.0.0'
  });
});

// Start server
async function startServer() {
  try {
    console.log('🔄 Connecting to PostgreSQL database...');
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');
    
    console.log('🔄 Synchronizing database models...');
    await sequelize.sync();
    console.log('✅ Database models synchronized');
    
    app.listen(PORT, () => {
      console.log(`🚀 AgroAI PERN Stack Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Database: PostgreSQL (${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME})`);
      console.log(`📱 SMS Service: ${twilioClient ? 'Twilio (Real)' : 'Simulation Mode'}`);
      console.log(`🤖 AI Service: ${geminiModel ? 'Gemini AI (Real)' : 'Simulation Mode'}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌾 Frontend: http://localhost:${PORT}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.log('\n📝 Setup Instructions:');
    console.log('1. Install PostgreSQL: https://www.postgresql.org/download/');
    console.log('2. Create database: CREATE DATABASE agroai;');
    console.log('3. Update .env file with your PostgreSQL credentials');
    console.log('4. Add GEMINI_API_KEY to .env for AI features');
    process.exit(1);
  }
}

startServer();
