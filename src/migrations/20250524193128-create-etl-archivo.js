// src/migrations/<timestamp>-create-etl-archivo.js
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ETLArchivos', { // Sequelize pluraliza
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Status: { // Status del manejo de archivo (ej. 'Leído Correctamente', 'No Encontrado', 'Error de Permisos')
        type: Sequelize.STRING,
        allowNull: false
      },
      Mensaje: { // Mensaje descriptivo sobre la operación del archivo
        type: Sequelize.TEXT,
        allowNull: true // Un mensaje podría ser opcional
      },
      idReporte: { // Foreign Key a la tabla Reportes
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Reportes', // Nombre de la tabla Reportes
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Si se borra el Reporte principal, se borra este detalle
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
    // Opcional: await queryInterface.addIndex('ETLArchivos', ['idReporte']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ETLArchivos');
  }
};