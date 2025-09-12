const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const OTP = require('../models/OTP');
const smsService = require('../services/smsService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Send OTP
router.post('/send-otp', [
    body('phoneNumber')
        .matches(/^[0-9]{10}$/)
        .withMessage('Phone number must be exactly 10 digits'),
    body('purpose')
        .optional()
        .isIn(['registration', 'login'])
        .withMessage('Purpose must be registration or login')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { phoneNumber, purpose = 'registration' } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ phoneNumber });
        
        if (purpose === 'registration' && existingUser) {
            return res.status(409).json({
                error: 'User already exists',
                message: 'This phone number is already registered. Please login instead.'
            });
        }

        if (purpose === 'login' && !existingUser) {
            return res.status(404).json({
                error: 'User not found',
                message: 'This phone number is not registered. Please register first.'
            });
        }

        // Clean up old OTPs for this phone number
        await OTP.deleteMany({ phoneNumber, isUsed: false });

        // Generate and save new OTP
        const otpCode = smsService.generateOTP();
        const otp = new OTP({
            phoneNumber,
            otp: otpCode,
            purpose
        });
        await otp.save();

        // Send OTP via SMS
        const smsResult = await smsService.sendOTP(phoneNumber, otpCode, purpose);

        if (!smsResult.success) {
            return res.status(500).json({
                error: 'Failed to send OTP',
                message: 'Could not send SMS. Please try again.'
            });
        }

        res.status(200).json({
            message: 'OTP sent successfully',
            expiresIn: '10 minutes',
            ...(process.env.NODE_ENV === 'development' && { otp: otpCode }) // Only in development
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to send OTP'
        });
    }
});

// Verify OTP and Login/Register
router.post('/verify-otp', [
    body('phoneNumber')
        .matches(/^[0-9]{10}$/)
        .withMessage('Phone number must be exactly 10 digits'),
    body('otp')
        .matches(/^[0-9]{6}$/)
        .withMessage('OTP must be exactly 6 digits'),
    body('language')
        .optional()
        .isIn(['en', 'hi', 'pa'])
        .withMessage('Language must be en, hi, or pa'),
    body('district')
        .optional()
        .isString()
        .withMessage('District must be a string')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { phoneNumber, otp, language = 'en', district } = req.body;

        // Find valid OTP
        const otpRecord = await OTP.findOne({
            phoneNumber,
            otp,
            isUsed: false,
            expiresAt: { $gt: new Date() }
        });

        if (!otpRecord) {
            // Increment attempts for existing OTP records
            await OTP.updateMany(
                { phoneNumber, isUsed: false },
                { $inc: { attempts: 1 } }
            );

            return res.status(400).json({
                error: 'Invalid OTP',
                message: 'OTP is invalid, expired, or already used'
            });
        }

        // Check attempts
        if (otpRecord.attempts >= 3) {
            await OTP.deleteMany({ phoneNumber });
            return res.status(429).json({
                error: 'Too many attempts',
                message: 'Please request a new OTP'
            });
        }

        // Mark OTP as used
        otpRecord.isUsed = true;
        await otpRecord.save();

        // Find or create user
        let user = await User.findOne({ phoneNumber });
        let isNewUser = false;

        if (!user) {
            // Create new user
            if (!district) {
                return res.status(400).json({
                    error: 'District required',
                    message: 'District is required for new user registration'
                });
            }

            user = new User({
                phoneNumber,
                language,
                district,
                isPhoneVerified: true,
                lastLogin: new Date()
            });
            isNewUser = true;
        } else {
            // Update existing user
            user.isPhoneVerified = true;
            user.lastLogin = new Date();
            if (language) user.language = language;
            if (district) user.district = district;
        }

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, phoneNumber: user.phoneNumber },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Log activity
        await user.addActivity(isNewUser ? 'user_registered' : 'user_login', {
            language,
            district,
            method: 'otp'
        });

        res.status(200).json({
            message: isNewUser ? 'Registration successful' : 'Login successful',
            token,
            user: {
                id: user._id,
                phoneNumber: user.phoneNumber,
                language: user.language,
                district: user.district,
                isNewUser,
                profile: user.profile
            }
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to verify OTP'
        });
    }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        res.status(200).json({
            user: {
                id: req.user._id,
                phoneNumber: req.user.phoneNumber,
                language: req.user.language,
                district: req.user.district,
                profile: req.user.profile,
                crops: req.user.crops,
                notifications: req.user.notifications,
                lastLogin: req.user.lastLogin,
                createdAt: req.user.createdAt
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to get profile'
        });
    }
});

// Refresh token
router.post('/refresh', authenticateToken, async (req, res) => {
    try {
        const token = jwt.sign(
            { userId: req.user._id, phoneNumber: req.user.phoneNumber },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(200).json({
            message: 'Token refreshed',
            token
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to refresh token'
        });
    }
});

// Logout (optional - for activity logging)
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        await req.user.addActivity('user_logout', {
            timestamp: new Date()
        });

        res.status(200).json({
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to logout'
        });
    }
});

module.exports = router;
