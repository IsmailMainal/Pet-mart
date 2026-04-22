const { sequelize } = require('./models');
const { DataTypes } = require('sequelize');

async function migrate() {
  console.log('🚀 Starting Invoice table migration...');
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    const tableInfo = await queryInterface.describeTable('Invoices');

    const columnsToAdd = {
      discountAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      discountType: { type: DataTypes.ENUM('FLAT', 'PERCENTAGE'), allowNull: true },
      couponCode: { type: DataTypes.STRING, allowNull: true },
      paymentMode: { type: DataTypes.ENUM('CASH', 'ONLINE'), defaultValue: 'CASH' },
      utrNumber: { type: DataTypes.STRING, allowNull: true },
      doctorCharges: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      doctorId: { type: DataTypes.INTEGER, allowNull: true },
      userId: { type: DataTypes.INTEGER, allowNull: true },
      createdBy: { type: DataTypes.INTEGER, allowNull: true }
    };

    for (const [columnName, definition] of Object.entries(columnsToAdd)) {
      if (!tableInfo[columnName]) {
        console.log(`➕ Adding column: ${columnName}`);
        await queryInterface.addColumn('Invoices', columnName, definition);
      } else {
        console.log(`ℹ️  Column ${columnName} already exists, skipping.`);
      }
    }

    console.log('✅ Invoice migration completed successfully.');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

migrate();
