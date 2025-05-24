// src/migrations/<timestamp>-create-etl-alerta.js
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ETLAlertas', { // Sequelize pluraliza
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Nombre: { // Nombre de la alerta o del evento principal de ejecución
        type: Sequelize.STRING,
        allowNull: false
      },
      HostName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      HoraInicio: {
        type: Sequelize.DATE,
        allowNull: false
      },
      HoraFin: {
        type: Sequelize.DATE,
        allowNull: false
      },
      TiempoEjecucion: { // En milisegundos o la unidad que prefieras
        type: Sequelize.INTEGER, // Podría ser BIGINT si los tiempos son muy largos
        allowNull: true // Puede ser que no siempre se calcule o reporte
      },
      idReporte: { // Foreign Key a la tabla Reportes
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Reportes', // Nombre de la tabla Reportes
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
    // Opcional: await queryInterface.addIndex('ETLAlertas', ['idReporte']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ETLAlertas');
  }
};