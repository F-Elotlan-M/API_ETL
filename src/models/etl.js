// src/models/etl.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ETL extends Model {
    static associate(models) {
      // Un ETL puede estar asociado a muchos registros de Permiso
      ETL.hasMany(models.Permiso, {
        foreignKey: 'idEtl',
        as: 'permisos'
      });
      // ----> AÑADE ESTA NUEVA ASOCIACIÓN <----
      ETL.hasMany(models.Reporte, {
        foreignKey: 'idEtl',
        as: 'reportes' // Usaremos este alias
      });
      // ------------------------------------
    }
  }
  ETL.init({
    // El 'id' es manejado automáticamente por Sequelize
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: true
    }
    // createdAt y updatedAt son manejados automáticamente por Sequelize si timestamps: true (default)
  }, {
    sequelize,
    modelName: 'ETL', // Nombre del modelo en singular
    tableName: 'ETLs', // Nombre de la tabla en plural (convención, pero puedes cambiarla)
    // timestamps: true // Ya es true por defecto
  });
  return ETL;
};