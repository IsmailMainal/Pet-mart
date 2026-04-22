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

    const adminEmail = 'admin@bijapurpetcare.com';
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (existingAdmin) {
      console.log(`ℹ️ Admin user with email ${adminEmail} already exists.`);
    } else {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Admin user created successfully!');
      console.log(`📧 Email: ${adminEmail}`);
      console.log('🔑 Password: bijapurpetcare@028');
    }

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

createAdmin();
