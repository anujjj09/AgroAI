const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        match: /^[0-9]{10}$/
    },
    otp: {
        type: String,
        required: true,
        length: 6
    },
    purpose: {
        type: String,
        enum: ['registration', 'login', 'password_reset'],
        default: 'registration'
    },
    attempts: {
        type: Number,
        default: 0,
        max: 3
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        index: { expireAfterSeconds: 0 }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for cleanup
otpSchema.index({ phoneNumber: 1, createdAt: -1 });

module.exports = mongoose.model('OTP', otpSchema);
