const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  phone_number: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    validate: {
      is: /^[6-9]\d{9}$/
    }
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  district: {
    type: DataTypes.ENUM(
      'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib',
      'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar',
      'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar',
      'Pathankot', 'Patiala', 'Rupnagar', 'Sahibzada Ajit Singh Nagar',
      'Sangrur', 'Shaheed Bhagat Singh Nagar', 'Tarn Taran'
    ),
    allowNull: false
  },
  village: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  preferred_language: {
    type: DataTypes.ENUM('en', 'hi', 'pa'),
    defaultValue: 'en'
  },
  farm_size: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  farming_experience: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  // Notification preferences stored as JSON
  notifications: {
    type: DataTypes.JSONB,
    defaultValue: {
      weather: true,
      market: true,
      community: true,
      alerts: true,
      sms: false,
      push: true
    }
  },
  profile_visibility: {
    type: DataTypes.ENUM('public', 'friends', 'private'),
    defaultValue: 'public'
  },
  show_phone_number: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reputation: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  posts_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  helpful_answers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  last_login: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  last_active_district: {
    type: DataTypes.STRING
  },
  total_sessions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_banned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ban_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'users',
  indexes: [
    { fields: ['phone_number'] },
    { fields: ['district'] },
    { fields: ['is_verified'] },
    { fields: ['last_login'] },
    { fields: ['reputation'] }
  ]
});

// Instance methods
User.prototype.generateAccessToken = function() {
  return jwt.sign(
    { 
      userId: this.id, 
      phoneNumber: this.phone_number,
      district: this.district,
      role: 'user'
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

User.prototype.generateRefreshToken = function() {
  return jwt.sign(
    { userId: this.id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

User.prototype.getPublicProfile = function() {
  const user = this.toJSON();
  return user;
};

User.prototype.getCommunityProfile = function() {
  return {
    id: this.id,
    name: this.name,
    district: this.district,
    avatar: this.avatar,
    reputation: this.reputation,
    farming_experience: this.farming_experience,
    created_at: this.created_at
  };
};

User.prototype.updateActivity = function() {
  this.last_login = new Date();
  this.total_sessions += 1;
  this.last_active_district = this.district;
  return this.save();
};

User.prototype.updateReputation = function(points) {
  this.reputation = Math.max(0, this.reputation + points);
  return this.save();
};

User.prototype.canModerate = function() {
  return this.reputation >= 100;
};

User.prototype.canCreatePolls = function() {
  return this.reputation >= 50;
};

module.exports = User;
