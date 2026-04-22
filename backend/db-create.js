require('dotenv').config();
const mysql = require('mysql2/promise');

async function createDatabase() {
  console.log('🔍 Connecting to MySQL server to ensure database exists...');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      ssl: {
        rejectUnauthorized: false
      }
    });

    const dbName = process.env.DB_NAME || 'petMart_db';
    
    console.log(`🚀 Executing: CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    
    console.log(`✅ Database "${dbName}" is ready.`);
    await connection.end();
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('👉 Check your database credentials and permissions.');
    }
    process.exit(1);
  }
}

createDatabase();
