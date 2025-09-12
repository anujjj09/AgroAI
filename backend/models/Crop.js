const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Crop = sequelize.define('Crop', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 50]
    }
  },
  area: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  variety: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  planting_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expected_harvest: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('planted', 'growing', 'harvested', 'sold'),
    defaultValue: 'planted'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'crops',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['name'] },
    { fields: ['planting_date'] },
    { fields: ['status'] }
  ]
});

module.exports = Crop;
