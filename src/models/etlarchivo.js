// src/models/etlarchivo.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ETLArchivo extends Model {
    static associate(models) {
      // Un ETLArchivo pertenece a un Reporte
      ETLArchivo.belongsTo(models.Reporte, {
        foreignKey: 'idReporte',
        as: 'reporte',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
  ETLArchivo.init({
    // Usaremos `field` para mapear atributos camelCase a columnas PascalCase
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'Status'
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Mensaje'
    },
    idReporte: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ETLArchivo',
    tableName: 'ETLArchivos'
  });
  return ETLArchivo;
};