const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT },
  type: { type: DataTypes.ENUM('info', 'success', 'warning', 'error'), defaultValue: 'info' },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  link: { type: DataTypes.STRING, allowNull: true }
});

module.exports = Notification;
