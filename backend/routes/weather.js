const express = require('express');
const axios = require('axios');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// District coordinates for Punjab
const getDistrictCoordinates = (districtName) => {
    const coordinates = {
        'Amritsar': { lat: 31.6340, lon: 74.8723 },
        'Barnala': { lat: 30.3785, lon: 75.5457 },
        'Bathinda': { lat: 30.2110, lon: 74.9455 },
        'Faridkot': { lat: 30.6704, lon: 74.7597 },
        'Fatehgarh Sahib': { lat: 30.6466, lon: 76.3956 },
        'Fazilka': { lat: 30.4037, lon: 74.0246 },
        'Ferozepur': { lat: 30.9233, lon: 74.6133 },
        'Gurdaspur': { lat: 32.0422, lon: 75.4035 },
        'Hoshiarpur': { lat: 31.5338, lon: 75.9115 },
        'Jalandhar': { lat: 31.3260, lon: 75.5762 },
        'Kapurthala': { lat: 31.3800, lon: 75.3800 },
        'Ludhiana': { lat: 30.9010, lon: 75.8573 },
        'Mansa': { lat: 29.9836, lon: 75.3936 },
        'Moga': { lat: 30.8176, lon: 75.1724 },
        'Muktsar': { lat: 30.4762, lon: 74.5165 },
        'Pathankot': { lat: 32.2746, lon: 75.6505 },
        'Patiala': { lat: 30.3396, lon: 76.3922 },
        'Rupnagar': { lat: 30.9692, lon: 76.5267 },
        'Sahibzada Ajit Singh Nagar': { lat: 30.6802, lon: 76.7274 },
        'Sangrur': { lat: 30.2459, lon: 75.8421 },
        'Shaheed Bhagat Singh Nagar': { lat: 31.1048, lon: 76.2349 },
        'Tarn Taran': { lat: 31.4516, lon: 74.9255 }
    };
    return coordinates[districtName] || coordinates['Ludhiana'];
};

// Get current weather for district
router.get('/current/:district', optionalAuth, async (req, res) => {
    try {
        const { district } = req.params;
        const coords = getDistrictCoordinates(district);

        if (!process.env.OPENWEATHER_API_KEY) {
            return res.status(500).json({
                error: 'Configuration error',
                message: 'Weather API key not configured'
            });
        }

        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
        );

        const weatherData = {
            district,
            coordinates: coords,
            temperature: Math.round(response.data.main.temp),
            feelsLike: Math.round(response.data.main.feels_like),
            humidity: response.data.main.humidity,
            pressure: response.data.main.pressure,
            windSpeed: response.data.wind.speed,
            windDirection: response.data.wind.deg,
            visibility: response.data.visibility,
            cloudiness: response.data.clouds.all,
            condition: response.data.weather[0].main,
            description: response.data.weather[0].description,
            icon: response.data.weather[0].icon,
            sunrise: new Date(response.data.sys.sunrise * 1000),
            sunset: new Date(response.data.sys.sunset * 1000),
            timestamp: new Date()
        };

        // Log user activity if authenticated
        if (req.user) {
            await req.user.addActivity('weather_viewed', { district, temperature: weatherData.temperature });
        }

        res.status(200).json({
            success: true,
            data: weatherData
        });

    } catch (error) {
        console.error('Weather API error:', error);
        
        if (error.response && error.response.status === 401) {
            return res.status(500).json({
                error: 'API error',
                message: 'Invalid weather API key'
            });
        }

        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch weather data'
        });
    }
});

// Get weather forecast for district
router.get('/forecast/:district', optionalAuth, async (req, res) => {
    try {
        const { district } = req.params;
        const { days = 5 } = req.query;
        const coords = getDistrictCoordinates(district);

        if (!process.env.OPENWEATHER_API_KEY) {
            return res.status(500).json({
                error: 'Configuration error',
                message: 'Weather API key not configured'
            });
        }

        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&cnt=${Math.min(parseInt(days) * 8, 40)}`
        );

        const forecastData = response.data.list.map(item => ({
            datetime: new Date(item.dt * 1000),
            temperature: Math.round(item.main.temp),
            feelsLike: Math.round(item.main.feels_like),
            humidity: item.main.humidity,
            pressure: item.main.pressure,
            windSpeed: item.wind.speed,
            condition: item.weather[0].main,
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            cloudiness: item.clouds.all,
            precipitation: item.rain ? item.rain['3h'] : 0
        }));

        // Group by days
        const dailyForecast = {};
        forecastData.forEach(item => {
            const day = item.datetime.toDateString();
            if (!dailyForecast[day]) {
                dailyForecast[day] = [];
            }
            dailyForecast[day].push(item);
        });

        // Log user activity if authenticated
        if (req.user) {
            await req.user.addActivity('weather_forecast_viewed', { district, days });
        }

        res.status(200).json({
            success: true,
            data: {
                district,
                coordinates: coords,
                forecast: forecastData,
                dailyForecast,
                timestamp: new Date()
            }
        });

    } catch (error) {
        console.error('Weather forecast API error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch weather forecast'
        });
    }
});

// Get weather alerts for district
router.get('/alerts/:district', authenticateToken, async (req, res) => {
    try {
        const { district } = req.params;
        const coords = getDistrictCoordinates(district);

        // For now, we'll create basic alerts based on current weather
        // In a real implementation, you might use weather alert APIs
        const weatherResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
        );

        const alerts = [];
        const weather = weatherResponse.data;

        // Temperature alerts
        if (weather.main.temp > 40) {
            alerts.push({
                type: 'heat_wave',
                severity: 'high',
                message: `Extreme heat warning: ${Math.round(weather.main.temp)}°C. Protect crops and livestock.`,
                recommendations: ['Increase irrigation', 'Provide shade for animals', 'Avoid midday field work']
            });
        } else if (weather.main.temp < 5) {
            alerts.push({
                type: 'cold_wave',
                severity: 'high',
                message: `Cold wave warning: ${Math.round(weather.main.temp)}°C. Risk of crop damage.`,
                recommendations: ['Cover sensitive crops', 'Check livestock shelter', 'Protect water pipes']
            });
        }

        // Wind alerts
        if (weather.wind && weather.wind.speed > 15) {
            alerts.push({
                type: 'high_wind',
                severity: 'medium',
                message: `Strong winds: ${weather.wind.speed} m/s. Risk to tall crops.`,
                recommendations: ['Secure loose structures', 'Check crop support systems']
            });
        }

        // Humidity alerts
        if (weather.main.humidity > 85 && weather.main.temp > 25) {
            alerts.push({
                type: 'high_humidity',
                severity: 'medium',
                message: `High humidity (${weather.main.humidity}%) with warm temperature. Disease risk increased.`,
                recommendations: ['Monitor for fungal diseases', 'Improve ventilation', 'Consider preventive spraying']
            });
        }

        await req.user.addActivity('weather_alerts_viewed', { district, alertCount: alerts.length });

        res.status(200).json({
            success: true,
            data: {
                district,
                alerts,
                timestamp: new Date()
            }
        });

    } catch (error) {
        console.error('Weather alerts error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch weather alerts'
        });
    }
});

module.exports = router;
