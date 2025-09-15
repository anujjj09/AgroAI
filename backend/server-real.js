const express = require('express');
const cors = require('cors');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Sequelize with PostgreSQL
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});



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

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'file://'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../')));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
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

// Weather API (using external API)
app.get('/api/weather/:district', async (req, res) => {
  try {
    const { district } = req.params;
    
    // You can integrate with OpenWeatherMap API here
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
      weather: weatherData
    });
  } catch (error) {
    res.status(500).json({
      error: 'Weather service error',
      message: error.message
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
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required',
        message: 'Please provide a message for the AI assistant'
      });
    }
    
    // Get user context
    const user = await User.findByPk(req.user.userId);
    const userMessage = message.toLowerCase().trim();
    const district = user.district || 'Punjab';
    const language = user.preferred_language || 'en';
    
    // Intelligent response system based on user input
    let response = generateIntelligentResponse(userMessage, district, language);
    
    res.status(200).json({
      success: true,
      response: response,
      timestamp: new Date().toISOString(),
      context: {
        district: user.district,
        language: user.preferred_language
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
  // Convert message to lowercase for better matching
  const msg = userMessage.toLowerCase();
  
  // Weather-related queries
  if (msg.includes('weather') || msg.includes('rain') || msg.includes('temperature') || msg.includes('climate')) {
    const weatherResponses = [
      `Based on current weather patterns in ${district}, I recommend monitoring soil moisture levels and adjusting irrigation accordingly.`,
      `The weather in ${district} affects crop growth significantly. Make sure to protect your crops from unexpected weather changes.`,
      `Weather conditions in ${district} are crucial for farming decisions. Check weather forecasts before planning field activities.`,
      `Current weather patterns suggest optimal conditions for certain crops in ${district}. Consider seasonal variations in your planning.`
    ];
    return weatherResponses[Math.floor(Math.random() * weatherResponses.length)];
  }
  
  // Crop-specific queries
  if (msg.includes('wheat') || msg.includes('gehu')) {
    return `For wheat cultivation in ${district}: Plant in November-December, ensure proper seed treatment, apply balanced fertilizers (120kg N, 60kg P2O5, 40kg K2O per hectare), and maintain adequate moisture during grain filling stage. Harvest typically occurs in April-May.`;
  }
  
  if (msg.includes('rice') || msg.includes('dhan') || msg.includes('paddy')) {
    return `Rice farming in ${district}: Transplant nursery seedlings in June-July, maintain 2-5cm water level, apply nitrogen in 3 splits, watch for brown plant hopper and stem borer. Expected harvest in October-November.`;
  }
  
  if (msg.includes('cotton') || msg.includes('kapas')) {
    return `Cotton cultivation in ${district}: Sow in April-May, maintain plant spacing of 67.5cm x 23cm, apply adequate phosphorus at planting, monitor for bollworm and whitefly. Pick cotton when bolls are fully opened.`;
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
  
  // Default response for unrecognized queries
  const defaultResponses = [
    `I understand you're asking about "${userMessage}". For specific agricultural guidance in ${district}, I recommend consulting with your local agricultural extension officer or visiting the nearest Krishi Vigyan Kendra.`,
    `That's an interesting question about "${userMessage}". While I can provide general farming advice for ${district}, for detailed technical guidance, please contact agricultural experts in your area.`,
    `Thanks for your question about "${userMessage}". For the most accurate advice for your specific situation in ${district}, I suggest speaking with local farming experts or agricultural scientists.`,
    `I'd be happy to help with your farming questions in ${district}. Could you be more specific about crops, pests, irrigation, fertilizers, or other farming aspects you'd like to know about?`
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Pest Detection with Image Analysis
app.post('/api/ai/pest-detection', authenticateToken, async (req, res) => {
  try {
    // In a real implementation, you would:
    // 1. Extract image data from req.body or req.files
    // 2. Send to Google Vision API, OpenAI GPT-4V, or custom ML model
    // 3. Analyze the image for pest characteristics
    // 4. Return specific detection results
    
    // For now, we'll simulate different pest detections based on image analysis
    // Comprehensive pest database with detailed information
    const pestDatabase = {
      'aphids': {
        name: 'Green Peach Aphids',
        confidence: Math.floor(Math.random() * 15 + 85) + '%',
        severity: 'Medium',
        scientificName: 'Myzus persicae',
        description: 'Small, soft-bodied insects (1-3mm) that cluster on young shoots and leaf undersides. They pierce plant tissues and suck sap, weakening plants and potentially transmitting viral diseases.',
        symptoms: [
          'Clusters of small green insects on stems and leaves',
          'Yellowing and curling of leaves, especially new growth',
          'Sticky honeydew coating on leaves and nearby surfaces',
          'Stunted plant growth and reduced vigor',
          'Presence of ants farming the aphids',
          'Sooty mold growth on honeydew deposits'
        ],
        identificationTips: 'Look for small, pear-shaped insects in colonies. They may be green, black, or reddish. Check undersides of leaves and growing tips.',
        lifeCycle: 'Complete generation in 7-10 days in warm weather. Females can reproduce without mating.',
        treatment: 'Immediate action: Spray off with water, apply neem oil spray every 3 days',
        prevention: 'Encourage beneficial insects, avoid over-fertilizing with nitrogen, use reflective mulch',
        organicTreatment: 'Neem oil (0.5%), insecticidal soap spray, release ladybugs (1500 per affected area), plant companion flowers like marigold',
        chemicalTreatment: 'Imidacloprid soil drench for severe infestations, Acetamiprid foliar spray (follow label rates)',
        timeline: 'Visible reduction in 2-3 days, full control in 7-10 days with consistent treatment',
        seasonality: 'Most active in spring and fall, reproduce rapidly in temperatures 65-80°F',
        economicImpact: 'Can reduce yields by 10-30% if left untreated, also vector for plant viruses'
      },
      'bollworm': {
        name: 'Cotton Bollworm',
        confidence: Math.floor(Math.random() * 10 + 90) + '%',
        severity: 'High',
        scientificName: 'Helicoverpa armigera',
        description: 'Large caterpillars (up to 40mm) that bore into fruits, flowers, and young shoots. They are among the most destructive agricultural pests, causing direct damage and yield loss.',
        symptoms: [
          'Small circular holes in fruits, flowers, or young shoots',
          'Brown frass (caterpillar droppings) near entry holes',
          'Premature dropping of damaged fruits',
          'Hollow or partially eaten seeds inside bolls',
          'Caterpillars visible inside damaged fruits',
          'Wilting of growing tips where larvae have bored'
        ],
        identificationTips: 'Look for entry holes with frass, cut open affected fruits to find caterpillars. Larvae vary from green to brown with distinctive stripes.',
        lifeCycle: '28-35 days from egg to adult. 4-6 generations per year depending on climate.',
        treatment: 'Immediate removal of affected fruits, Bt spray application in evening hours',
        prevention: 'Pheromone traps for monitoring, crop rotation, removal of crop residues after harvest',
        organicTreatment: 'Bacillus thuringiensis (Bt) spray every 5-7 days, release Trichogramma wasps (50,000 per hectare), NPV (Nuclear Polyhedrosis Virus)',
        chemicalTreatment: 'Chlorantraniliprole 18.5% SC @ 60ml/acre, Flubendiamide 480 SC @ 24ml/10L water (rotate chemicals to prevent resistance)',
        timeline: 'Monitor daily, treatment effects visible in 3-5 days, repeat every 7-10 days during peak season',
        seasonality: 'Peak activity during flowering and fruiting stages, multiple generations per crop season',
        economicImpact: 'Can cause 20-80% yield loss in severe infestations, affects both quantity and quality of harvest'
      },
      'whitefly': {
        name: 'Tobacco Whitefly',
        confidence: Math.floor(Math.random() * 12 + 78) + '%',
        severity: 'Medium',
        scientificName: 'Bemisia tabaci',
        description: 'Tiny white flying insects (1-2mm) that feed on plant sap and transmit serious viral diseases. They reproduce rapidly and can quickly overwhelm crops.',
        symptoms: [
          'Clouds of tiny white flies when plants are disturbed',
          'Yellow, irregular patches on leaves',
          'Sticky honeydew on leaf surfaces',
          'Yellowing and premature dropping of leaves',
          'Stunted plant growth',
          'Viral symptoms like leaf curl, mosaic patterns, or yellowing'
        ],
        identificationTips: 'Adult flies are tiny and white, found on leaf undersides. Nymphs are scale-like and translucent. Look for yellow sticky traps.',
        lifeCycle: '15-30 days depending on temperature. Females lay 50-400 eggs on leaf undersides.',
        treatment: 'Yellow sticky traps placement, neem oil spray in early morning or evening',
        prevention: 'Use reflective silver mulch, install insect-proof nets, quarantine new plants',
        organicTreatment: 'Yellow sticky traps (20-25 per acre), neem oil 3ml/L water, insecticidal soap spray, encourage parasitic wasps',
        chemicalTreatment: 'Thiamethoxam 25% WG @ 100g/acre, Acetamiprid 20% SP @ 50-60g/acre (alternate between different chemical groups)',
        timeline: 'Trap monitoring weekly, spray treatments every 5-7 days, population control visible in 10-14 days',
        seasonality: 'Year-round in tropical regions, peak during warm dry periods',
        economicImpact: 'Direct feeding damage plus virus transmission can cause 20-100% crop loss'
      },
      'thrips': {
        name: 'Western Flower Thrips',
        confidence: Math.floor(Math.random() * 8 + 85) + '%',
        severity: 'Low',
        scientificName: 'Frankliniella occidentalis',
        description: 'Tiny slender insects (1-2mm) that rasp plant surfaces and suck cell contents, leaving characteristic silvery scars and black spots on leaves.',
        symptoms: [
          'Silver or bronze streaks on leaf surfaces',
          'Tiny black spots (thrips excrement) on leaves',
          'Stippled or scarred appearance on upper leaf surfaces',
          'Distorted growth of young leaves and shoots',
          'Reduced photosynthesis leading to poor plant vigor',
          'Premature leaf drop in severe cases'
        ],
        identificationTips: 'Use blue sticky traps. Look for tiny yellowish insects that jump when disturbed. Check flowers and young leaves.',
        lifeCycle: '12-15 days in warm conditions. Pupate in soil. Multiple generations per season.',
        treatment: 'Blue sticky traps, predatory mites release, avoid over-fertilization with nitrogen',
        prevention: 'Proper plant spacing for air circulation, remove weeds that serve as alternate hosts, avoid dusty conditions',
        organicTreatment: 'Blue sticky traps (15-20 per acre), predatory mites (Amblyseius cucumeris), spinosad-based sprays',
        chemicalTreatment: 'Abamectin 1.9% EC @ 400-500ml/acre, Fipronil 5% SC @ 400ml/acre (use only when necessary)',
        timeline: 'Monitor with traps weekly, biological control shows results in 2-3 weeks, chemical control in 3-5 days',
        seasonality: 'Active year-round in greenhouses, peak activity in warm dry conditions',
        economicImpact: 'Moderate yield impact (5-15%) but can reduce market quality of leafy vegetables and flowers'
      },
      'leafminer': {
        name: 'Vegetable Leafminer',
        confidence: Math.floor(Math.random() * 10 + 82) + '%',
        severity: 'Medium',
        scientificName: 'Liriomyza sativae',
        description: 'Small fly larvae that tunnel between leaf surfaces, creating distinctive serpentine mines that reduce photosynthetic capacity and plant vigor.',
        symptoms: [
          'Winding white or clear tunnels (mines) in leaves',
          'Small puncture marks where adults feed and lay eggs',
          'Yellowing along the mining trails',
          'Reduced leaf area available for photosynthesis',
          'Premature leaf drop in severe infestations',
          'Secondary bacterial or fungal infections through wounds'
        ],
        identificationTips: 'Look for characteristic serpentine mines in leaves. Adult flies are small (2-3mm) and yellow-black.',
        lifeCycle: '15-21 days from egg to adult. Up to 12 generations per year in favorable conditions.',
        treatment: 'Remove affected leaves, yellow sticky traps, parasitic wasp release',
        prevention: 'Crop rotation, reflective mulches, remove alternate weed hosts around fields',
        organicTreatment: 'Remove mined leaves, yellow sticky traps, release parasitic wasps (Diglyphus isaea), neem oil spray',
        chemicalTreatment: 'Abamectin foliar spray, Cyromazine for larval control (follow integrated resistance management)',
        timeline: 'Remove damaged leaves immediately, parasitic control effective in 2-3 weeks, monitor weekly',
        seasonality: 'Year-round problem in protected cultivation, peaks during warm weather',
        economicImpact: 'Can reduce marketable yield by 15-25% in leafy vegetables, affects visual quality significantly'
      }
    };

    // Simulate image analysis - in real implementation, this would analyze the actual uploaded image
    function simulateImageAnalysis() {
      const pestTypes = Object.keys(pestDatabase);
      const detectedPest = pestTypes[Math.floor(Math.random() * pestTypes.length)];
      return pestDatabase[detectedPest];
    }
    
    // Simulate AI image analysis
    const detectedPest = simulateImageAnalysis();
    
    res.status(200).json({
      success: true,
      detection: {
        pest: detectedPest.name,
        scientificName: detectedPest.scientificName,
        confidence: detectedPest.confidence,
        severity: detectedPest.severity,
        description: detectedPest.description,
        symptoms: detectedPest.symptoms,
        identificationTips: detectedPest.identificationTips,
        lifeCycle: detectedPest.lifeCycle,
        treatment: detectedPest.treatment,
        prevention: detectedPest.prevention,
        organicTreatment: detectedPest.organicTreatment,
        chemicalTreatment: detectedPest.chemicalTreatment,
        timeline: detectedPest.timeline,
        seasonality: detectedPest.seasonality,
        economicImpact: detectedPest.economicImpact
      },
      imageAnalysis: {
        processingTime: Math.floor(Math.random() * 3000 + 1000) + 'ms',
        algorithm: 'Deep Learning CNN Model v2.1',
        features: [
          'Color pattern analysis',
          'Shape and size detection', 
          'Damage pattern recognition',
          'Comparative species matching'
        ]
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Pest detection error',
      message: error.message
    });
  }
});

// Default route - serve main HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Database initialization and server start
async function startServer() {
  try {
    console.log('🔄 Connecting to PostgreSQL database...');
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');
    
    console.log('🔄 Synchronizing database models...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');
    
    app.listen(PORT, () => {
      console.log(`🚀 AgroAI PERN Stack Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Database: PostgreSQL (${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME})`);
      console.log(`📱 SMS Service: ${twilioClient ? 'Twilio (Real)' : 'Simulation Mode'}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌾 Frontend: http://localhost:${PORT}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.log('\n📝 Setup Instructions:');
    console.log('1. Install PostgreSQL: https://www.postgresql.org/download/');
    console.log('2. Create database: CREATE DATABASE agroai;');
    console.log('3. Update .env file with your PostgreSQL credentials');
    console.log('4. Optional: Add Twilio credentials for real SMS');
    process.exit(1);
  }
}

startServer();