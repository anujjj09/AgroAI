// Simple placeholder routes - will be implemented when needed
const express = require('express');
const router = express.Router();

// Placeholder for crop-specific endpoints
router.get('/info/:cropName', (req, res) => {
    res.status(200).json({
        message: 'Crop information endpoint - to be implemented',
        crop: req.params.cropName
    });
});

module.exports = router;
