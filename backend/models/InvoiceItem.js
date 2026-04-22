const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InvoiceItem = sequelize.define('InvoiceItem', {
  itemName: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: true },
  serviceId: { type: DataTypes.INTEGER, allowNull: true },
  invoiceId: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = InvoiceItem;
