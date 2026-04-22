const { sequelize, User } = require('../models');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
  try {
    // Sync models with the database
    // We use alter: true to update the schema without losing data
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully.');
    
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized.');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@bijapurpetcare.com';
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      throw new Error('❌ ADMIN_PASSWORD is not set in .env file');
    }

    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (existingAdmin) {
      console.log(`ℹ️ Admin user with email ${adminEmail} already exists.`);
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Admin user created successfully!');
      console.log(`📧 Email: ${adminEmail}`);
      // Password logging removed for security
    }

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

createAdmin();
