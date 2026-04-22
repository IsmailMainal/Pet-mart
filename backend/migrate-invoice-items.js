const { sequelize } = require('./models');
const { DataTypes } = require('sequelize');

async function migrate() {
  console.log('🚀 Starting InvoiceItems table migration...');
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    const tableInfo = await queryInterface.describeTable('InvoiceItems');

    const columnsToAdd = {
      serviceId: { type: DataTypes.INTEGER, allowNull: true }
    };

    for (const [columnName, definition] of Object.entries(columnsToAdd)) {
      if (!tableInfo[columnName]) {
        console.log(`➕ Adding column: ${columnName}`);
        await queryInterface.addColumn('InvoiceItems', columnName, definition);
      } else {
        console.log(`ℹ️  Column ${columnName} already exists, skipping.`);
      }
    }

    console.log('✅ InvoiceItems migration completed successfully.');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

migrate();
