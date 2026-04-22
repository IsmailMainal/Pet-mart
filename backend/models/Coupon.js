const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(val) {
      this.setDataValue('code', val.toUpperCase());
    }
  },
  type: {
    type: DataTypes.ENUM('FLAT', 'PERCENTAGE'),
    allowNull: false,
    defaultValue: 'PERCENTAGE',
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  minPurchase: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
});

module.exports = Coupon;
