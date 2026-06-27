require('dotenv').config();
const { User } = require('./models');
const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@petshop.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    if (existingAdmin) {
      console.log(`Admin ${adminEmail} already exists.`);
      // Update password just in case
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await existingAdmin.update({ password: hashedPassword, role: 'admin' });
      console.log('Admin password/role updated.');
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      console.log(`Admin ${adminEmail} created successfully.`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
}

seedAdmin();
