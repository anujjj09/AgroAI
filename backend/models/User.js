const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        match: /^[0-9]{10}$/
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    language: {
        type: String,
        enum: ['en', 'hi', 'pa'],
        default: 'en'
    },
    district: {
        type: String,
        required: true,
        enum: [
            'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib',
            'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar',
            'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar',
            'Pathankot', 'Patiala', 'Rupnagar', 'Sahibzada Ajit Singh Nagar',
            'Sangrur', 'Shaheed Bhagat Singh Nagar', 'Tarn Taran'
        ]
    },
    profile: {
        name: String,
        email: String,
        farmLocation: {
            coordinates: [Number], // [longitude, latitude]
            address: String
        },
        soilType: {
            type: String,
            enum: ['Sandy', 'Clay', 'Loamy', 'Silt', 'Peaty', 'Chalk']
        },
        farmSize: Number, // in acres
        experience: String, // farming experience in years
        preferredCrops: [String]
    },
    crops: [{
        name: String,
        variety: String,
        acres: Number,
        plantingDate: Date,
        expectedHarvest: Date,
        stage: {
            type: String,
            enum: ['Sowing', 'Growing', 'Flowering', 'Harvesting', 'Post-harvest']
        },
        notes: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    notifications: {
        weather: { type: Boolean, default: true },
        market: { type: Boolean, default: true },
        pests: { type: Boolean, default: true },
        community: { type: Boolean, default: true },
        pushToken: String // For push notifications
    },
    activityLog: [{
        action: String,
        details: mongoose.Schema.Types.Mixed,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    lastLogin: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for geospatial queries
userSchema.index({ "profile.farmLocation.coordinates": "2dsphere" });

// Update timestamp on save
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Methods
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.__v;
    return user;
};

userSchema.methods.addActivity = function(action, details) {
    this.activityLog.push({ action, details });
    // Keep only last 100 activities
    if (this.activityLog.length > 100) {
        this.activityLog = this.activityLog.slice(-100);
    }
    return this.save();
};

module.exports = mongoose.model('User', userSchema);
