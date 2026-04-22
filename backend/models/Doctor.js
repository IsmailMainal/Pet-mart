const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Doctor = sequelize.define('Doctor', {
  name: { type: DataTypes.STRING, allowNull: false },
  specialization: { type: DataTypes.STRING, allowNull: false },
  experience: { type: DataTypes.INTEGER },
  availability: { type: DataTypes.STRING }
});

module.exports = Doctor;
