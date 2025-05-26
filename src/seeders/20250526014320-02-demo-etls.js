// src/seeders/<timestamp>-02-demo-etls.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ETLs', [
      {
        // No especificamos 'id'
        nombre: 'ETL Ventas Diarias',
        tipo: 'Procesamientos',
        descripcion: 'Procesa las ventas consolidadas del día anterior.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'ETL Inventario Semanal',
        tipo: 'Procesamientos',
        descripcion: 'Actualiza el stock de inventario cada semana.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'ETL Reporte Clientes Nuevos',
        tipo: 'Archivos',
        descripcion: 'Genera un reporte de nuevos clientes adquiridos en el mes.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'ETL Monitorización y Alertas',
        tipo: 'Alertas',
        descripcion: 'Monitorea el sistema y genera alertas críticas.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'ETL Carga de Archivos Externos',
        tipo: 'Archivos',
        descripcion: 'Procesa archivos recibidos de fuentes externas y valida su estructura.',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    // Para el 'down', podemos borrar por nombre si son únicos, o todos si es seguro.
    // Si los nombres no son únicos, borrar por IDs sería más preciso,
    // pero como no los conocemos de antemano, borrar un subconjunto es más complejo sin IDs.
    // Por simplicidad para un 'down' de seed, a menudo se borran todos o por un criterio general.
    await queryInterface.bulkDelete('ETLs', {
      nombre: [
        'ETL Ventas Diarias',
        'ETL Inventario Semanal',
        'ETL Reporte Clientes Nuevos',
        'ETL Monitorización y Alertas',
        'ETL Carga de Archivos Externos'
      ]
    }, {});
    // O si quieres borrar todos los ETLs del seeder:
    // await queryInterface.bulkDelete('ETLs', null, {});
  }
};