// src/seeders/<timestamp>-04-demo-reportes-y-detalles.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const fechaSimuladaHoy = new Date('2025-05-25T10:00:00Z'); 
      const fechaSimuladaAyer = new Date(fechaSimuladaHoy);
      fechaSimuladaAyer.setDate(fechaSimuladaHoy.getDate() - 1);
      const fechaSimuladaHaceDosDias = new Date(fechaSimuladaHoy);
      fechaSimuladaHaceDosDias.setDate(fechaSimuladaHoy.getDate() - 2);

      // Insertar en Reportes sin especificar 'id'
      // Los IDs generados serán 1, 2, 3, 4, 5 si la tabla está vacía
      await queryInterface.bulkInsert('Reportes', [
        { idEtl: 1, FechaReporte: fechaSimuladaHoy, Status: 'Exitoso', createdAt: new Date(), updatedAt: new Date() },             // Esperado ID Reporte: 1
        { idEtl: 1, FechaReporte: fechaSimuladaAyer, Status: 'Fallido Crítico', createdAt: new Date(), updatedAt: new Date() },      // Esperado ID Reporte: 2
        { idEtl: 5, FechaReporte: fechaSimuladaHoy, Status: 'Exitoso', createdAt: new Date(), updatedAt: new Date() },             // Esperado ID Reporte: 3
        { idEtl: 4, FechaReporte: fechaSimuladaHoy, Status: 'Fallido Crítico', createdAt: new Date(), updatedAt: new Date() },      // Esperado ID Reporte: 4
        { idEtl: 2, FechaReporte: fechaSimuladaHaceDosDias, Status: 'Exitoso', createdAt: new Date(), updatedAt: new Date() }, // Esperado ID Reporte: 5
      ], { transaction });

      // Insertar detalles usando los IDs de Reporte que asumimos se generaron (1, 2, 3, 4, 5)
      await queryInterface.bulkInsert('ETLProcesamientos', [
        { idReporte: 1, Nombre: 'Proceso Ventas 2025-05-25', Fecha: fechaSimuladaHoy, NombreArchivo: 'ventas_20250525.csv', Status: 'OK', Mensaje: '1000 ventas procesadas.', createdAt: new Date(), updatedAt: new Date() },
        { idReporte: 2, Nombre: 'Proceso Ventas 2025-05-24 - Fallo', Fecha: fechaSimuladaAyer, NombreArchivo: 'ventas_20250524.csv', Status: 'ERROR_CONEXION_BD', Mensaje: 'No se pudo conectar a la BD de destino.', createdAt: new Date(), updatedAt: new Date() },
        { idReporte: 5, Nombre: 'Proceso Inventario Semanal', Fecha: fechaSimuladaHaceDosDias, NombreArchivo: null, Status: 'OK', Mensaje: 'Inventario actualizado.', createdAt: new Date(), updatedAt: new Date() },
      ], { transaction });

      await queryInterface.bulkInsert('ETLArchivos', [
        { idReporte: 3, Status: 'Leído Correctamente', Mensaje: 'Archivo partner_data.xml procesado.', createdAt: new Date(), updatedAt: new Date() },
      ], { transaction });
      
      await queryInterface.bulkInsert('ETLAlertas', [
        { idReporte: 4, Nombre: 'Fallo General ETL Monitorización', HostName: 'srv-etl-monitor', HoraInicio: new Date(new Date(fechaSimuladaHoy).setHours(9,0,0)), HoraFin: fechaSimuladaHoy, TiempoEjecucion: 3600000, createdAt: new Date(), updatedAt: new Date() },
      ], { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('ETLProcesamientos', null, { transaction });
      await queryInterface.bulkDelete('ETLArchivos', null, { transaction });
      await queryInterface.bulkDelete('ETLAlertas', null, { transaction });
      await queryInterface.bulkDelete('Reportes', null, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};