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