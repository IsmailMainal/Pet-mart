const { sequelize } = require('./models');

const migrations = [
  // InvoiceItems — add missing serviceId column
  {
    table: 'InvoiceItems',
    column: 'serviceId',
    def: 'INT NULL',
  },
];

(async () => {
  try {
    for (const m of migrations) {
      const [existing] = await sequelize.query(`DESCRIBE ${m.table}`);
      const cols = existing.map(c => c.Field);
      if (cols.includes(m.column)) {
        console.log(`⏭️  Skip (exists): ${m.table}.${m.column}`);
      } else {
        await sequelize.query(`ALTER TABLE ${m.table} ADD COLUMN ${m.column} ${m.def}`);
        console.log(`✅ Added: ${m.table}.${m.column}`);
      }
    }
    const [cols] = await sequelize.query('DESCRIBE InvoiceItems');
    console.log('\nInvoiceItems columns:', cols.map(c => c.Field).join(', '));
    await sequelize.close();
    console.log('\n🎉 Done!');
  } catch (e) {
    console.error('❌ Failed:', e.message);
    process.exit(1);
  }
})();
