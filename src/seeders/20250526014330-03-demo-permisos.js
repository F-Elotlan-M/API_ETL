// src/seeders/<timestamp>-03-demo-permisos.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Permisos', [
      {
        idUsuario: 2, // Asume que 'consultor_user' es ID 2
        idEtl: 1,     // Asume que 'ETL Ventas Diarias' es ID 1
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        idUsuario: 2, // consultor_user
        idEtl: 3,     // ETL Reporte Clientes Nuevos
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        idUsuario: 3, // consultor_dos
        idEtl: 2,     // ETL Inventario Semanal
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        idUsuario: 3, // consultor_dos
        idEtl: 4,     // ETL Monitorización y Alertas
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Permisos', {
      idUsuario: [2, 3]
    }, {});
  }
};