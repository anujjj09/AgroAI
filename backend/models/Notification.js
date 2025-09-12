const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['weather', 'market', 'pest', 'crop_stage', 'general', 'government']
    },
    title: {
        type: String,
        required: true,
        maxlength: 100
    },
    message: {
        type: String,
        required: true,
        maxlength: 500
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    district: String,
    crops: [String], // Relevant crops
    data: mongoose.Schema.Types.Mixed, // Additional data (weather data, prices, etc.)
    isRead: {
        type: Boolean,
        default: false
    },
    channels: [{
        type: String,
        enum: ['push', 'sms', 'email', 'in_app']
    }],
    scheduledFor: Date, // For scheduled alerts
    sentAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const chatSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messages: [{
        role: {
            type: String,
            enum: ['user', 'assistant'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        metadata: {
            crop: String,
            district: String,
            language: String,
            imageUrl: String, // For pest detection images
            confidence: Number // For AI responses
        }
    }],
    context: {
        crops: [String],
        district: String,
        language: String,
        lastActivity: {
            type: Date,
            default: Date.now
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes
alertSchema.index({ user: 1, createdAt: -1 });
alertSchema.index({ district: 1, type: 1 });
alertSchema.index({ scheduledFor: 1 });
alertSchema.index({ isRead: 1, createdAt: -1 });

chatSessionSchema.index({ user: 1, isActive: 1, updatedAt: -1 });

// Auto-expire chat sessions after 7 days of inactivity
chatSessionSchema.index({ "context.lastActivity": 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

// Update timestamp on message addition
chatSessionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    if (this.messages.length > 0) {
        this.context.lastActivity = Date.now();
    }
    next();
});

const Alert = mongoose.model('Alert', alertSchema);
const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

module.exports = { Alert, ChatSession };
