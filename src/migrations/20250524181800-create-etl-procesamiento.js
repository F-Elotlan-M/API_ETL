// src/migrations/<timestamp>-create-etl-procesamiento.js
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ETLProcesamientos', { // Sequelize pluraliza
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Nombre: { // Nombre del paso de procesamiento, o un nombre general para este detalle
        type: Sequelize.STRING,
        allowNull: false
      },
      Fecha: { // Fecha específica del evento de procesamiento
        type: Sequelize.DATE,
        allowNull: false
      },
      NombreArchivo: {
        type: Sequelize.STRING,
        allowNull: true // Puede que no siempre haya un archivo asociado
      },
      Status: { // Status del paso/detalle de procesamiento
        type: Sequelize.STRING,
        allowNull: false
      },
      Mensaje: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      idReporte: { // Foreign Key a la tabla Reportes
        type: Sequelize.INTEGER,
        allowNull: false, // Un detalle de procesamiento debe estar ligado a un reporte general
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
    // Opcional: Añadir un índice a idReporte si se espera consultar frecuentemente por él
    // await queryInterface.addIndex('ETLProcesamientos', ['idReporte']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ETLProcesamientos');
  }
};