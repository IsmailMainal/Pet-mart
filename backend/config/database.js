require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'petMart_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || 'pass',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: process.env.DB_SSL === 'true' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false // Often needed for hosted DBs like Aiven/DigitalOcean
      }
    } : {}
  }
);

module.exports = sequelize;
