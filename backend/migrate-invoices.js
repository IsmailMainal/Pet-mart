const { sequelize } = require('./models');

const columns = [
  { name: 'discountAmount', def: 'DECIMAL(10,2) DEFAULT 0' },
  { name: 'discountType',   def: "ENUM('FLAT','PERCENTAGE') NULL" },
  { name: 'couponCode',     def: 'VARCHAR(255) NULL' },
  { name: 'paymentMode',    def: "ENUM('CASH','ONLINE') DEFAULT 'CASH'" },
  { name: 'utrNumber',      def: 'VARCHAR(255) NULL' },
];

(async () => {
  try {
    // Get current columns
    const [existing] = await sequelize.query('DESCRIBE Invoices');
    const existingNames = existing.map(c => c.Field);
    console.log('Existing columns:', existingNames.join(', '));

    for (const col of columns) {
      if (existingNames.includes(col.name)) {
        console.log(`⏭️  Skip (already exists): ${col.name}`);
      } else {
        await sequelize.query(`ALTER TABLE Invoices ADD COLUMN ${col.name} ${col.def}`);
        console.log(`✅ Added: ${col.name}`);
      }
    }

    const [updated] = await sequelize.query('DESCRIBE Invoices');
    console.log('\n✔ Final columns:', updated.map(c => c.Field).join(', '));
    await sequelize.close();
    console.log('\n🎉 Migration complete!');
  } catch (e) {
    console.error('❌ Migration failed:', e.message);
    process.exit(1);
  }
})();
