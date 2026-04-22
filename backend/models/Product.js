const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  description: { type: DataTypes.TEXT },
  quantity: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  indexes: [
    { fields: ['name'] }
  ]
});

module.exports = Product;
