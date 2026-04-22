const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductImage = sequelize.define('ProductImage', {
  imageUrl: { type: DataTypes.STRING, allowNull: false },
  publicId: { type: DataTypes.STRING, allowNull: true },
  type: { type: DataTypes.ENUM('thumbnail', 'medium', 'high'), defaultValue: 'high' },
  productId: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = ProductImage;
