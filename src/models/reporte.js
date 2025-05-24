// src/models/reporte.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reporte extends Model {
    static associate(models) {
      // Un Reporte pertenece a un ETL
      Reporte.belongsTo(models.ETL, {
        foreignKey: 'idEtl',
        as: 'etl', // Usaremos este alias en las consultas
        onDelete: 'SET NULL', // Coincide con la migración
        onUpdate: 'CASCADE'
      });
      Reporte.hasOne(models.ETLProcesamiento, { // Un Reporte tiene un detalle de procesamiento
        foreignKey: 'idReporte',
        as: 'detalleProcesamiento'
      });
      Reporte.hasOne(models.ETLArchivo, { // Un Reporte (de tipo Archivo) tiene un detalle de archivo
        foreignKey: 'idReporte',
        as: 'detalleArchivo'
      });
      Reporte.hasOne(models.ETLAlerta, { // Un Reporte (de tipo Alerta) tiene un detalle de alerta/ejecución
        foreignKey: 'idReporte',
        as: 'detalleAlerta'
      });
    }
  }
  Reporte.init({
    FechaReporte: {
      type: DataTypes.DATE,
      allowNull: false
    },
    Status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    idEtl: { // Sequelize maneja la FK, pero es bueno tenerla definida
      type: DataTypes.INTEGER,
      allowNull: true // Coincide con la migración para ON DELETE SET NULL
    }
  }, {
    sequelize,
    modelName: 'Reporte',
    tableName: 'Reportes'
  });
  return Reporte;
};