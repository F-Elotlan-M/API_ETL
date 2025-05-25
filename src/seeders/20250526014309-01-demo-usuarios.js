// src/seeders/<timestamp>-01-demo-usuarios.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Usuarios', [
      {
        // No especificamos 'id', se autogenerará
        nombre: 'admin_user',
        rol: 'Administrador',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'consultor_user',
        rol: 'Consultor',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'consultor_dos',
        rol: 'Consultor',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Usuarios', { 
      nombre: ['admin_user', 'consultor_user', 'consultor_dos'] 
    }, {});
  }
};