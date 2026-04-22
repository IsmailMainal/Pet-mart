const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  email: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true,
    validate: { isEmail: true }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  role: { 
    type: DataTypes.ENUM('admin', 'receptionist', 'customer'), 
    defaultValue: 'customer' 
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  indexes: [
    { name: 'users_phone_idx', fields: ['phone'] },
    { name: 'users_role_idx', fields: ['role'] }
  ]
});

module.exports = User;
