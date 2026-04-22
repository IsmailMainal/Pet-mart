const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  date: { type: DataTypes.DATEONLY, allowNull: false },
  time: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled'), defaultValue: 'Pending' },
  reason: { type: DataTypes.STRING },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  doctorId: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = Appointment;
