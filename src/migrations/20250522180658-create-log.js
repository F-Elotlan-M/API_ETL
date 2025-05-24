'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Logs', { // Sequelize pluraliza a 'Logs'
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Servicio: {
        type: Sequelize.STRING,
        allowNull: false
      },
      Fecha_Inicio: {
        type: Sequelize.DATE,
        allowNull: false
      },
      Fecha_Fin: {
        type: Sequelize.DATE,
        allowNull: false
      },
      Tiempo_Res: { // En milisegundos
        type: Sequelize.INTEGER,
        allowNull: false
      },
      Peticion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      Respuesta: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      Ip: {
        type: Sequelize.STRING,
        allowNull: true
      },
      Usuario: { // Guardará el nombre de usuario o un identificador
        type: Sequelize.STRING,
        allowNull: true // Permitir nulo si no hay usuario autenticado
      },
      Codigo_Res: { // Código de estado HTTP
        type: Sequelize.INTEGER,
        allowNull: false
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
    await queryInterface.dropTable('Logs');
  }
};