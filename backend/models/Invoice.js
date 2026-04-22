const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  invoiceNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
  customerName: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  tax: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.ENUM('Draft', 'Paid', 'Cancelled'), defaultValue: 'Draft' },
  discountAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  discountType: { type: DataTypes.ENUM('FLAT', 'PERCENTAGE'), allowNull: true },
  couponCode: { type: DataTypes.STRING, allowNull: true },
  paymentMode: { type: DataTypes.ENUM('CASH', 'ONLINE'), defaultValue: 'CASH' },
  utrNumber: { type: DataTypes.STRING, allowNull: true },
  createdBy: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: true }, // Link to customer user
  doctorId: { type: DataTypes.INTEGER, allowNull: true }, // Assigned doctor
  doctorCharges: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 }
});

module.exports = Invoice;
