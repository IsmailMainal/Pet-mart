const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Settlement = sequelize.define('Settlement', {
  doctorId: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  method: { type: DataTypes.STRING, defaultValue: 'CASH' }, // CASH, ONLINE, TRANSFER
  reference: { type: DataTypes.STRING },
  remarks: { type: DataTypes.TEXT },
  recordedBy: { type: DataTypes.INTEGER }
});

module.exports = Settlement;
