const express = require('express');
const cron = require('node-cron');
const { authenticateToken } = require('../middleware/auth');
const { Alert } = require('../models/Notification');
const User = require('../models/User');
const smsService = require('../services/smsService');

const router = express.Router();

// Get user notifications/alerts
router.get('/alerts', authenticateToken, async (req, res) => {
    try {
        const { limit = 20, offset = 0, type, isRead } = req.query;
        const user = req.user;

        let query = { user: user._id };
        if (type) query.type = type;
        if (isRead !== undefined) query.isRead = isRead === 'true';

        const alerts = await Alert.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset));

        const total = await Alert.countDocuments(query);
        const unreadCount = await Alert.countDocuments({ user: user._id, isRead: false });

        res.status(200).json({
            success: true,
            alerts,
            total,
            unreadCount,
            hasMore: (parseInt(offset) + parseInt(limit)) < total
        });

    } catch (error) {
        console.error('Get alerts error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch alerts'
        });
    }
});

// Mark alert as read
router.put('/alerts/:alertId/read', authenticateToken, async (req, res) => {
    try {
        const { alertId } = req.params;
        const user = req.user;

        const alert = await Alert.findOne({ _id: alertId, user: user._id });
        if (!alert) {
            return res.status(404).json({
                error: 'Alert not found'
            });
        }

        alert.isRead = true;
        await alert.save();

        res.status(200).json({
            success: true,
            message: 'Alert marked as read'
        });

    } catch (error) {
        console.error('Mark alert read error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to mark alert as read'
        });
    }
});

// Mark all alerts as read
router.put('/alerts/read-all', authenticateToken, async (req, res) => {
    try {
        const user = req.user;

        await Alert.updateMany(
            { user: user._id, isRead: false },
            { isRead: true }
        );

        res.status(200).json({
            success: true,
            message: 'All alerts marked as read'
        });

    } catch (error) {
        console.error('Mark all alerts read error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to mark all alerts as read'
        });
    }
});

// Send custom alert to user (admin function)
router.post('/send-alert', authenticateToken, async (req, res) => {
    try {
        const { userId, type, title, message, severity, channels } = req.body;
        
        // In a real app, add admin authorization check here
        
        const alert = new Alert({
            user: userId,
            type,
            title,
            message,
            severity: severity || 'medium',
            channels: channels || ['in_app']
        });

        await alert.save();

        // Send via requested channels
        if (channels && channels.includes('sms')) {
            const user = await User.findById(userId);
            if (user) {
                await smsService.sendAlert(user.phoneNumber, message);
                alert.sentAt = new Date();
                await alert.save();
            }
        }

        res.status(201).json({
            success: true,
            message: 'Alert sent successfully',
            alert
        });

    } catch (error) {
        console.error('Send alert error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to send alert'
        });
    }
});

// Helper function to create weather alerts
async function createWeatherAlert(users, weatherData, district) {
    const alerts = [];

    for (const user of users) {
        if (!user.notifications.weather) continue;

        let alertData = null;

        // Temperature alerts
        if (weatherData.temperature > 40) {
            alertData = {
                type: 'weather',
                title: 'Heat Wave Warning',
                message: `Extreme heat expected in ${district}: ${weatherData.temperature}°C. Protect crops and increase irrigation.`,
                severity: 'high',
                data: weatherData
            };
        } else if (weatherData.temperature < 5) {
            alertData = {
                type: 'weather',
                title: 'Cold Wave Warning',
                message: `Cold wave warning for ${district}: ${weatherData.temperature}°C. Risk of crop damage.`,
                severity: 'high',
                data: weatherData
            };
        }

        // Wind alerts
        if (weatherData.windSpeed > 15) {
            alertData = {
                type: 'weather',
                title: 'High Wind Alert',
                message: `Strong winds expected: ${weatherData.windSpeed} m/s. Secure farm structures.`,
                severity: 'medium',
                data: weatherData
            };
        }

        if (alertData) {
            const alert = new Alert({
                user: user._id,
                district,
                ...alertData,
                channels: ['in_app', 'push']
            });
            
            alerts.push(alert);
        }
    }

    if (alerts.length > 0) {
        await Alert.insertMany(alerts);
        console.log(`Created ${alerts.length} weather alerts for ${district}`);
    }
}

// Helper function to create market alerts
async function createMarketAlert(users, commodity, priceChange, district) {
    const alerts = [];

    for (const user of users) {
        if (!user.notifications.market) continue;

        // Check if user grows this commodity
        const userCrops = user.crops.map(c => c.name.toLowerCase());
        if (!userCrops.includes(commodity.toLowerCase())) continue;

        const alert = new Alert({
            user: user._id,
            type: 'market',
            title: `${commodity} Price ${priceChange > 0 ? 'Increase' : 'Decrease'}`,
            message: `${commodity} prices ${priceChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(priceChange)}% in ${district}`,
            severity: Math.abs(priceChange) > 10 ? 'high' : 'medium',
            district,
            crops: [commodity],
            data: { priceChange, commodity },
            channels: ['in_app', 'push']
        });

        alerts.push(alert);
    }

    if (alerts.length > 0) {
        await Alert.insertMany(alerts);
        console.log(`Created ${alerts.length} market alerts for ${commodity} in ${district}`);
    }
}

// Scheduled tasks for automated alerts
if (process.env.NODE_ENV !== 'test') {
    // Weather alerts - runs every 6 hours
    cron.schedule('0 */6 * * *', async () => {
        try {
            console.log('Running scheduled weather alert check...');
            
            const districts = [
                'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib',
                'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar',
                'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar',
                'Pathankot', 'Patiala', 'Rupnagar', 'Sahibzada Ajit Singh Nagar',
                'Sangrur', 'Shaheed Bhagat Singh Nagar', 'Tarn Taran'
            ];

            for (const district of districts) {
                const users = await User.find({ 
                    district, 
                    'notifications.weather': true 
                });

                if (users.length === 0) continue;

                // Fetch current weather (you'd implement this)
                // For now, we'll skip the actual weather fetching
                // const weatherData = await fetchWeatherForDistrict(district);
                // await createWeatherAlert(users, weatherData, district);
            }
        } catch (error) {
            console.error('Weather alert cron error:', error);
        }
    });

    // Market price alerts - runs daily at 8 AM
    cron.schedule('0 8 * * *', async () => {
        try {
            console.log('Running scheduled market alert check...');
            
            // Implementation would compare today's prices with yesterday's
            // and create alerts for significant changes
            
        } catch (error) {
            console.error('Market alert cron error:', error);
        }
    });
}

module.exports = router;
