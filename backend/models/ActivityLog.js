const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ActivityLog = sequelize.define('ActivityLog', {
  action: { type: DataTypes.STRING, allowNull: false },
  details: { type: DataTypes.TEXT },
  entity: { type: DataTypes.STRING },
  entityId: { type: DataTypes.INTEGER },
  userId: { type: DataTypes.INTEGER, allowNull: true }
});

module.exports = ActivityLog;
