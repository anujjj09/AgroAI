const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Update user profile
router.put('/profile', authenticateToken, [
    body('name').optional().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('soilType').optional().isIn(['Sandy', 'Clay', 'Loamy', 'Silt', 'Peaty', 'Chalk']),
    body('farmSize').optional().isNumeric().withMessage('Farm size must be a number'),
    body('experience').optional().isString(),
    body('language').optional().isIn(['en', 'hi', 'pa']),
    body('district').optional().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const updates = req.body;
        const user = req.user;

        // Update profile fields
        if (updates.name) user.profile.name = updates.name;
        if (updates.email) user.profile.email = updates.email;
        if (updates.soilType) user.profile.soilType = updates.soilType;
        if (updates.farmSize) user.profile.farmSize = updates.farmSize;
        if (updates.experience) user.profile.experience = updates.experience;
        if (updates.language) user.language = updates.language;
        if (updates.district) user.district = updates.district;

        // Update farm location if provided
        if (updates.farmLocation) {
            if (updates.farmLocation.coordinates && Array.isArray(updates.farmLocation.coordinates)) {
                user.profile.farmLocation.coordinates = updates.farmLocation.coordinates;
            }
            if (updates.farmLocation.address) {
                user.profile.farmLocation.address = updates.farmLocation.address;
            }
        }

        // Update preferred crops
        if (updates.preferredCrops && Array.isArray(updates.preferredCrops)) {
            user.profile.preferredCrops = updates.preferredCrops;
        }

        await user.save();
        await user.addActivity('profile_updated', { updates: Object.keys(updates) });

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                phoneNumber: user.phoneNumber,
                language: user.language,
                district: user.district,
                profile: user.profile
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to update profile'
        });
    }
});

// Add crop
router.post('/crops', authenticateToken, [
    body('name').notEmpty().withMessage('Crop name is required'),
    body('variety').optional().isString(),
    body('acres').isNumeric().withMessage('Acres must be a number'),
    body('plantingDate').optional().isISO8601().withMessage('Invalid planting date'),
    body('expectedHarvest').optional().isISO8601().withMessage('Invalid harvest date'),
    body('stage').optional().isIn(['Sowing', 'Growing', 'Flowering', 'Harvesting', 'Post-harvest']),
    body('notes').optional().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const cropData = req.body;
        const user = req.user;

        const newCrop = {
            name: cropData.name,
            variety: cropData.variety || '',
            acres: cropData.acres,
            plantingDate: cropData.plantingDate ? new Date(cropData.plantingDate) : undefined,
            expectedHarvest: cropData.expectedHarvest ? new Date(cropData.expectedHarvest) : undefined,
            stage: cropData.stage || 'Sowing',
            notes: cropData.notes || '',
            createdAt: new Date()
        };

        user.crops.push(newCrop);
        await user.save();
        await user.addActivity('crop_added', { crop: newCrop.name, acres: newCrop.acres });

        res.status(201).json({
            message: 'Crop added successfully',
            crop: newCrop
        });

    } catch (error) {
        console.error('Add crop error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to add crop'
        });
    }
});

// Update crop
router.put('/crops/:cropId', authenticateToken, [
    body('name').optional().notEmpty().withMessage('Crop name cannot be empty'),
    body('variety').optional().isString(),
    body('acres').optional().isNumeric().withMessage('Acres must be a number'),
    body('stage').optional().isIn(['Sowing', 'Growing', 'Flowering', 'Harvesting', 'Post-harvest']),
    body('notes').optional().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { cropId } = req.params;
        const updates = req.body;
        const user = req.user;

        const crop = user.crops.id(cropId);
        if (!crop) {
            return res.status(404).json({
                error: 'Crop not found',
                message: 'The specified crop does not exist'
            });
        }

        // Update crop fields
        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) {
                crop[key] = updates[key];
            }
        });

        await user.save();
        await user.addActivity('crop_updated', { crop: crop.name, updates: Object.keys(updates) });

        res.status(200).json({
            message: 'Crop updated successfully',
            crop
        });

    } catch (error) {
        console.error('Update crop error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to update crop'
        });
    }
});

// Delete crop
router.delete('/crops/:cropId', authenticateToken, async (req, res) => {
    try {
        const { cropId } = req.params;
        const user = req.user;

        const crop = user.crops.id(cropId);
        if (!crop) {
            return res.status(404).json({
                error: 'Crop not found',
                message: 'The specified crop does not exist'
            });
        }

        const cropName = crop.name;
        crop.deleteOne();
        await user.save();
        await user.addActivity('crop_deleted', { crop: cropName });

        res.status(200).json({
            message: 'Crop deleted successfully'
        });

    } catch (error) {
        console.error('Delete crop error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to delete crop'
        });
    }
});

// Update notification preferences
router.put('/notifications', authenticateToken, [
    body('weather').optional().isBoolean(),
    body('market').optional().isBoolean(),
    body('pests').optional().isBoolean(),
    body('community').optional().isBoolean(),
    body('pushToken').optional().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const updates = req.body;
        const user = req.user;

        // Update notification preferences
        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) {
                user.notifications[key] = updates[key];
            }
        });

        await user.save();
        await user.addActivity('notifications_updated', updates);

        res.status(200).json({
            message: 'Notification preferences updated',
            notifications: user.notifications
        });

    } catch (error) {
        console.error('Update notifications error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to update notification preferences'
        });
    }
});

// Get user activity log
router.get('/activity', authenticateToken, async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;
        const user = req.user;

        const activities = user.activityLog
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

        res.status(200).json({
            activities,
            total: user.activityLog.length
        });

    } catch (error) {
        console.error('Get activity error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to get activity log'
        });
    }
});

module.exports = router;
