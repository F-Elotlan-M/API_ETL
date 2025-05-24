// src/migrations/<timestamp>-create-reporte.js (CORREGIDO para SET NULL)
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Reportes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      FechaReporte: {
        type: Sequelize.DATE,
        allowNull: false
      },
      Status: {
        type: Sequelize.STRING,
        allowNull: false
      },
      idEtl: {
        type: Sequelize.INTEGER,
        allowNull: true, // <-- CAMBIADO A true para permitir SET NULL
        references: {
          model: 'ETLs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // Ahora esto es válido
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Reportes');
  }
};