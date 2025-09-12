const express = require('express');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { ChatSession } = require('../models/Notification');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/crop-images';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `crop-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Chat with AI assistant
router.post('/chat', authenticateToken, [
    body('message').notEmpty().withMessage('Message is required'),
    body('language').optional().isIn(['en', 'hi', 'pa']).withMessage('Invalid language'),
    body('sessionId').optional().isMongoId().withMessage('Invalid session ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { message, language, sessionId } = req.body;
        const user = req.user;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                error: 'Configuration error',
                message: 'AI service not configured'
            });
        }

        // Find or create chat session
        let session;
        if (sessionId) {
            session = await ChatSession.findOne({ _id: sessionId, user: user._id, isActive: true });
        }
        
        if (!session) {
            session = new ChatSession({
                user: user._id,
                context: {
                    crops: user.crops.map(c => c.name),
                    district: user.district,
                    language: language || user.language
                }
            });
        }

        // Add user message to session
        session.messages.push({
            role: 'user',
            content: message,
            metadata: {
                district: user.district,
                language: language || user.language
            }
        });

        // Prepare context for AI
        const langName = { en: 'English', hi: 'Hindi', pa: 'Punjabi' }[language || user.language];
        const userCrops = user.crops.map(c => c.name).join(', ') || 'general farming';
        
        const systemPrompt = `You are AgroAI, an expert agricultural assistant specializing in Punjab agriculture. 
        
        User context:
        - Location: ${user.district}, Punjab, India
        - Crops: ${userCrops}
        - Language: ${langName}
        
        Provide helpful, practical, and localized farming advice. Keep responses concise but informative. 
        Always respond in ${langName}. Focus on Punjab-specific agricultural practices, weather patterns, and crop varieties.`;

        const prompt = `${systemPrompt}\n\nFarmer's question: "${message}"`;

        // Call Gemini API
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${process.env.GEMINI_API_KEY}`;
        
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000
            }
        };

        const response = await axios.post(apiUrl, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        const aiResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 
                          "I'm sorry, I couldn't process that question. Please try again.";

        // Add AI response to session
        session.messages.push({
            role: 'assistant',
            content: aiResponse,
            metadata: {
                district: user.district,
                language: language || user.language,
                confidence: 0.85 // You could implement actual confidence scoring
            }
        });

        await session.save();
        await user.addActivity('ai_chat', { 
            message: message.substring(0, 100), 
            language: language || user.language,
            sessionId: session._id
        });

        res.status(200).json({
            success: true,
            sessionId: session._id,
            response: aiResponse,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('AI Chat error:', error);
        
        if (error.response && error.response.status === 401) {
            return res.status(500).json({
                error: 'API error',
                message: 'Invalid AI service credentials'
            });
        }

        res.status(500).json({
            error: 'Server error',
            message: 'Failed to process AI request'
        });
    }
});

// Pest detection from image
router.post('/pest-detection', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'No image provided',
                message: 'Please upload an image for pest detection'
            });
        }

        const { language } = req.body;
        const user = req.user;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                error: 'Configuration error',
                message: 'AI service not configured'
            });
        }

        // Read and encode image
        const imagePath = req.file.path;
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Data = imageBuffer.toString('base64');
        const mimeType = req.file.mimetype;

        const langName = { en: 'English', hi: 'Hindi', pa: 'Punjabi' }[language || user.language];
        const prompt = `You are an expert agricultural entomologist and plant pathologist. Analyze the attached crop/plant image from ${user.district}, Punjab, India. 

        Provide a detailed analysis in ${langName} with the following structure:
        1. **Identified Issue:** (disease, pest, nutrient deficiency, or healthy)
        2. **Confidence Level:** (High/Medium/Low)
        3. **Severity:** (if applicable: Mild/Moderate/Severe)
        4. **Recommended Treatment:** (specific, actionable organic or chemical treatments)
        5. **Prevention:** (future prevention measures)
        
        If the image is unclear or doesn't show a plant, mention this clearly.`;

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${process.env.GEMINI_API_KEY}`;
        
        const payload = {
            contents: [{
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType, data: base64Data } }
                ]
            }],
            generationConfig: {
                temperature: 0.3, // Lower temperature for more factual responses
                maxOutputTokens: 1500
            }
        };

        const response = await axios.post(apiUrl, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        const analysis = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 
                        "Unable to analyze the image. Please try with a clearer image.";

        // Save to chat session for history
        let session = await ChatSession.findOne({ 
            user: user._id, 
            isActive: true 
        }).sort({ updatedAt: -1 });

        if (!session) {
            session = new ChatSession({
                user: user._id,
                context: {
                    crops: user.crops.map(c => c.name),
                    district: user.district,
                    language: language || user.language
                }
            });
        }

        session.messages.push({
            role: 'user',
            content: 'Pest/Disease Detection Request',
            metadata: {
                imageUrl: `/uploads/crop-images/${req.file.filename}`,
                district: user.district,
                language: language || user.language
            }
        });

        session.messages.push({
            role: 'assistant',
            content: analysis,
            metadata: {
                type: 'pest_detection',
                imageUrl: `/uploads/crop-images/${req.file.filename}`,
                confidence: 0.8
            }
        });

        await session.save();
        await user.addActivity('pest_detection', { 
            imageFile: req.file.filename,
            language: language || user.language,
            sessionId: session._id
        });

        res.status(200).json({
            success: true,
            analysis,
            imageUrl: `/uploads/crop-images/${req.file.filename}`,
            sessionId: session._id,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('Pest detection error:', error);
        
        // Clean up uploaded file on error
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupError) {
                console.error('File cleanup error:', cleanupError);
            }
        }

        res.status(500).json({
            error: 'Server error',
            message: 'Failed to analyze image'
        });
    }
});

// Get chat history
router.get('/chat-history', authenticateToken, async (req, res) => {
    try {
        const { limit = 10, offset = 0, sessionId } = req.query;
        const user = req.user;

        let query = { user: user._id };
        if (sessionId) {
            query._id = sessionId;
        }

        const sessions = await ChatSession.find(query)
            .sort({ updatedAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset));

        const totalSessions = await ChatSession.countDocuments(query);

        res.status(200).json({
            success: true,
            sessions,
            total: totalSessions,
            hasMore: (parseInt(offset) + parseInt(limit)) < totalSessions
        });

    } catch (error) {
        console.error('Chat history error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch chat history'
        });
    }
});

// End chat session
router.post('/end-session/:sessionId', authenticateToken, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const user = req.user;

        const session = await ChatSession.findOne({ 
            _id: sessionId, 
            user: user._id 
        });

        if (!session) {
            return res.status(404).json({
                error: 'Session not found',
                message: 'Chat session not found or access denied'
            });
        }

        session.isActive = false;
        await session.save();

        res.status(200).json({
            success: true,
            message: 'Chat session ended'
        });

    } catch (error) {
        console.error('End session error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to end chat session'
        });
    }
});

module.exports = router;
