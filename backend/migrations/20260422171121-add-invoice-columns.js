'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Invoices');

    const columnsToAdd = {
      discountAmount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      discountType: { type: Sequelize.ENUM('FLAT', 'PERCENTAGE'), allowNull: true },
      couponCode: { type: Sequelize.STRING, allowNull: true },
      paymentMode: { type: Sequelize.ENUM('CASH', 'ONLINE'), defaultValue: 'CASH' },
      utrNumber: { type: Sequelize.STRING, allowNull: true },
      doctorCharges: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      doctorId: { type: Sequelize.INTEGER, allowNull: true },
      userId: { type: Sequelize.INTEGER, allowNull: true },
      createdBy: { type: Sequelize.INTEGER, allowNull: true }
    };

    for (const [columnName, definition] of Object.entries(columnsToAdd)) {
      if (!tableInfo[columnName]) {
        await queryInterface.addColumn('Invoices', columnName, definition);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Invoices');

    const columnsToRemove = [
      'discountAmount', 'discountType', 'couponCode', 'paymentMode', 
      'utrNumber', 'doctorCharges', 'doctorId', 'userId', 'createdBy'
    ];

    for (const columnName of columnsToRemove) {
      if (tableInfo[columnName]) {
        await queryInterface.removeColumn('Invoices', columnName);
      }
    }
  }
};
