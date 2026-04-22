'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('InvoiceItems');

    if (!tableInfo['serviceId']) {
      await queryInterface.addColumn('InvoiceItems', 'serviceId', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('InvoiceItems');

    if (tableInfo['serviceId']) {
      await queryInterface.removeColumn('InvoiceItems', 'serviceId');
    }
  }
};
