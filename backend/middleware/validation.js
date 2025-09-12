const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please check your input data',
      details: errors.array()
    });
  }
  next();
};

// Phone number validation
const validatePhoneNumber = [
  body('phoneNumber')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit Indian phone number'),
  handleValidationErrors
];

// OTP validation
const validateOTP = [
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number'),
  body('phoneNumber')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid phone number'),
  handleValidationErrors
];

// User profile validation
const validateUserProfile = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  body('district')
    .isIn([
      'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib',
      'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar',
      'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar',
      'Pathankot', 'Patiala', 'Rupnagar', 'Sahibzada Ajit Singh Nagar',
      'Sangrur', 'Shaheed Bhagat Singh Nagar', 'Tarn Taran'
    ])
    .withMessage('Please select a valid district in Punjab'),
  body('preferredLanguage')
    .optional()
    .isIn(['en', 'hi', 'pa'])
    .withMessage('Language must be English, Hindi, or Punjabi'),
  body('village')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Village name cannot exceed 100 characters'),
  body('farmSize')
    .optional()
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Farm size must be between 0 and 10000 acres'),
  body('farmingExperience')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Farming experience must be between 0 and 100 years'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  handleValidationErrors
];

// Crop validation
const validateCrop = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Crop name must be between 2 and 50 characters'),
  body('area')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Crop area must be between 0 and 1000 acres'),
  body('variety')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Variety name cannot exceed 50 characters'),
  body('plantingDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid planting date'),
  body('expectedHarvest')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid harvest date'),
  handleValidationErrors
];

// Community post validation
const validateCommunityPost = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10 and 5000 characters'),
  body('category')
    .isIn(['general', 'crop_advice', 'pest_disease', 'weather', 'market', 'equipment', 'success_story'])
    .withMessage('Please select a valid category'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 tags allowed'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Each tag must be between 2 and 30 characters'),
  handleValidationErrors
];

// Community reply validation
const validateCommunityReply = [
  body('content')
    .trim()
    .isLength({ min: 5, max: 2000 })
    .withMessage('Reply content must be between 5 and 2000 characters'),
  body('parentReply')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent reply ID'),
  handleValidationErrors
];

// AI chat validation
const validateAIChat = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('sessionId')
    .optional()
    .isMongoId()
    .withMessage('Invalid session ID'),
  body('context')
    .optional()
    .isObject()
    .withMessage('Context must be an object'),
  handleValidationErrors
];

// Notification preferences validation
const validateNotificationPreferences = [
  body('weather')
    .optional()
    .isBoolean()
    .withMessage('Weather notification preference must be true or false'),
  body('market')
    .optional()
    .isBoolean()
    .withMessage('Market notification preference must be true or false'),
  body('community')
    .optional()
    .isBoolean()
    .withMessage('Community notification preference must be true or false'),
  body('alerts')
    .optional()
    .isBoolean()
    .withMessage('Alerts notification preference must be true or false'),
  body('sms')
    .optional()
    .isBoolean()
    .withMessage('SMS notification preference must be true or false'),
  body('push')
    .optional()
    .isBoolean()
    .withMessage('Push notification preference must be true or false'),
  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (field = 'id') => [
  param(field)
    .isMongoId()
    .withMessage(`Invalid ${field} format`),
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative number'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive number'),
  handleValidationErrors
];

// File upload validation (for multer)
const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'File required',
      message: 'Please upload a file'
    });
  }

  // Check file size (5MB limit)
  if (req.file.size > 5 * 1024 * 1024) {
    return res.status(400).json({
      error: 'File too large',
      message: 'File size must be less than 5MB'
    });
  }

  // Check file type for images
  if (req.file.fieldname === 'image' || req.file.fieldname === 'avatar') {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: 'Invalid file type',
        message: 'Only JPEG, PNG, GIF, and WebP images are allowed'
      });
    }
  }

  next();
};

// Custom validation for specific business logic
const validateDistrictAccess = (req, res, next) => {
  const userDistrict = req.user?.district;
  const requestedDistrict = req.params.district || req.query.district || req.body.district;

  // Allow access to own district or if no specific district requested
  if (!requestedDistrict || userDistrict === requestedDistrict) {
    return next();
  }

  // For weather and market data, allow access to any district
  if (req.path.includes('/weather') || req.path.includes('/market')) {
    return next();
  }

  res.status(403).json({
    error: 'Access denied',
    message: 'You can only access data for your registered district'
  });
};

// Validate crop names against common Punjab crops
const validatePunjabCrop = [
  body('name')
    .custom((value) => {
      const commonCrops = [
        'wheat', 'rice', 'maize', 'cotton', 'sugarcane', 'potato', 'onion',
        'tomato', 'peas', 'mustard', 'gram', 'lentil', 'bajra', 'jowar',
        'groundnut', 'sunflower', 'garlic', 'ginger', 'turmeric', 'chili'
      ];
      
      const cropName = value.toLowerCase().trim();
      // Allow if it's a common crop or contains common crop words
      const isValid = commonCrops.some(crop => 
        cropName.includes(crop) || crop.includes(cropName)
      );
      
      if (!isValid) {
        throw new Error('Please enter a valid crop name commonly grown in Punjab');
      }
      return true;
    }),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validatePhoneNumber,
  validateOTP,
  validateUserProfile,
  validateCrop,
  validateCommunityPost,
  validateCommunityReply,
  validateAIChat,
  validateNotificationPreferences,
  validateObjectId,
  validatePagination,
  validateFileUpload,
  validateDistrictAccess,
  validatePunjabCrop
};
