// src/migrations/<timestamp>-add-rol-to-usuarios.js
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Usuarios', 'rol', { // Nombre de la tabla, nombre de la nueva columna
      type: Sequelize.STRING,
      allowNull: true, // O false si quieres un defaultValue
      defaultValue: 'consultor' // Ejemplo si allowNull es false o quieres un default
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Usuarios', 'rol');
  }
};
