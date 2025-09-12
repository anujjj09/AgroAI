const express = require('express');
const axios = require('axios');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// District name mapping for API compatibility
const getAPIDistrictName = (district) => {
    const mapping = {
        'Bathinda': 'Bhatinda',
        'Rupnagar': 'Ropar (Rupnagar)',
        'Tarn Taran': 'Tarntaran'
    };
    return mapping[district] || district;
};

// Get market prices for district
router.get('/prices/:district', optionalAuth, async (req, res) => {
    try {
        const { district } = req.params;
        const { limit = 20 } = req.query;
        const apiDistrictName = getAPIDistrictName(district);

        if (!process.env.MARKET_API_KEY) {
            return res.status(500).json({
                error: 'Configuration error',
                message: 'Market API key not configured'
            });
        }

        try {
            // Try to fetch real market data
            const response = await axios.get(
                `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${process.env.MARKET_API_KEY}&format=json&filters[district]=${apiDistrictName}&limit=${limit}`
            );

            if (response.data.records && response.data.records.length > 0) {
                // Process real market data
                const marketData = response.data.records.map(record => ({
                    commodity: record.commodity,
                    variety: record.variety,
                    grade: record.grade,
                    market: record.market,
                    district: record.district,
                    state: record.state,
                    arrivalDate: record.arrival_date,
                    minPrice: parseFloat(record.min_price),
                    maxPrice: parseFloat(record.max_price),
                    modalPrice: parseFloat(record.modal_price),
                    priceUnit: '₹/quintal'
                }));

                // Log user activity if authenticated
                if (req.user) {
                    await req.user.addActivity('market_prices_viewed', { 
                        district, 
                        dataSource: 'government_api',
                        recordCount: marketData.length 
                    });
                }

                return res.status(200).json({
                    success: true,
                    dataSource: 'live',
                    district,
                    data: marketData,
                    lastUpdated: new Date(),
                    total: response.data.total
                });
            }
        } catch (apiError) {
            console.warn('Government API failed, using fallback data:', apiError.message);
        }

        // Fallback to simulated data if API fails or returns no data
        const fallbackData = generateFallbackMarketData(district);
        
        // Log user activity if authenticated
        if (req.user) {
            await req.user.addActivity('market_prices_viewed', { 
                district, 
                dataSource: 'simulated',
                recordCount: fallbackData.length 
            });
        }

        res.status(200).json({
            success: true,
            dataSource: 'simulated',
            district,
            data: fallbackData,
            lastUpdated: new Date(),
            message: 'Live data not available, showing estimated prices'
        });

    } catch (error) {
        console.error('Market prices error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch market prices'
        });
    }
});

// Get price trends for a commodity
router.get('/trends/:district/:commodity', authenticateToken, async (req, res) => {
    try {
        const { district, commodity } = req.params;
        const { days = 30 } = req.query;

        // For now, generate simulated trend data
        // In a real implementation, you'd fetch historical data
        const trendData = generatePriceTrends(commodity, parseInt(days));

        await req.user.addActivity('price_trends_viewed', { district, commodity, days });

        res.status(200).json({
            success: true,
            district,
            commodity,
            data: trendData,
            period: `${days} days`
        });

    } catch (error) {
        console.error('Price trends error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch price trends'
        });
    }
});

// Get market alerts and notifications
router.get('/alerts/:district', authenticateToken, async (req, res) => {
    try {
        const { district } = req.params;
        
        // Generate market alerts based on price changes
        const alerts = await generateMarketAlerts(district);

        await req.user.addActivity('market_alerts_viewed', { district, alertCount: alerts.length });

        res.status(200).json({
            success: true,
            district,
            alerts,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('Market alerts error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch market alerts'
        });
    }
});

// Helper function to generate fallback market data
function generateFallbackMarketData(district) {
    const basePrices = {
        'Wheat': { min: 2000, max: 2500, modal: 2250 },
        'Paddy(Dhan)(Common)': { min: 1800, max: 2200, modal: 2000 },
        'Cotton': { min: 6000, max: 7500, modal: 6800 },
        'Maize': { min: 1600, max: 2000, modal: 1800 },
        'Sugarcane': { min: 300, max: 350, modal: 325 },
        'Mustard': { min: 4500, max: 5500, modal: 5000 }
    };

    const varieties = {
        'Wheat': ['Desi', 'PBW-343', 'HD-2967'],
        'Paddy(Dhan)(Common)': ['Basmati', 'Non-Basmati', 'PR-106'],
        'Cotton': ['Desi', 'American', 'Hybrid'],
        'Maize': ['Yellow', 'White', 'Hybrid'],
        'Sugarcane': ['Common', 'CO-0238'],
        'Mustard': ['Local', 'Pusa Bold']
    };

    const marketData = [];
    
    Object.keys(basePrices).forEach(commodity => {
        const basePrice = basePrices[commodity];
        const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
        
        varieties[commodity].forEach(variety => {
            marketData.push({
                commodity,
                variety,
                grade: 'FAQ',
                market: `${district} Mandi`,
                district,
                state: 'Punjab',
                arrivalDate: new Date().toLocaleDateString('en-IN'),
                minPrice: Math.round(basePrice.min * (1 + variation)),
                maxPrice: Math.round(basePrice.max * (1 + variation)),
                modalPrice: Math.round(basePrice.modal * (1 + variation)),
                priceUnit: '₹/quintal'
            });
        });
    });

    return marketData;
}

// Helper function to generate price trends
function generatePriceTrends(commodity, days) {
    const basePrices = {
        'Wheat': 2250,
        'Paddy(Dhan)(Common)': 2000,
        'Cotton': 6800,
        'Maize': 1800,
        'Sugarcane': 325,
        'Mustard': 5000
    };

    const basePrice = basePrices[commodity] || 2000;
    const trends = [];
    let currentPrice = basePrice;

    for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Add some realistic price variation
        const variation = (Math.random() - 0.5) * 0.05; // ±2.5% daily variation
        currentPrice = Math.max(currentPrice * (1 + variation), basePrice * 0.8); // Don't go below 80% of base
        currentPrice = Math.min(currentPrice, basePrice * 1.3); // Don't go above 130% of base

        trends.push({
            date: date.toISOString().split('T')[0],
            price: Math.round(currentPrice),
            volume: Math.floor(Math.random() * 1000) + 100 // Simulated volume
        });
    }

    return trends;
}

// Helper function to generate market alerts
async function generateMarketAlerts(district) {
    const alerts = [];
    
    // Simulate price alerts
    const priceIncrease = Math.random() > 0.7;
    if (priceIncrease) {
        alerts.push({
            type: 'price_increase',
            severity: 'medium',
            commodity: 'Wheat',
            message: 'Wheat prices increased by 5% in the last week',
            recommendation: 'Good time to sell if you have stock',
            timestamp: new Date()
        });
    }

    const highDemand = Math.random() > 0.8;
    if (highDemand) {
        alerts.push({
            type: 'high_demand',
            severity: 'high',
            commodity: 'Cotton',
            message: 'High demand for cotton in nearby markets',
            recommendation: 'Consider transportation to higher-price markets',
            timestamp: new Date()
        });
    }

    return alerts;
}

module.exports = router;
