// src/models/etlalerta.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ETLAlerta extends Model {
    static associate(models) {
      // Un ETLAlerta pertenece a un Reporte
      ETLAlerta.belongsTo(models.Reporte, {
        foreignKey: 'idReporte',
        as: 'reporte',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
  ETLAlerta.init({
    // Usaremos `field` para mapear atributos camelCase a columnas PascalCase
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'Nombre'
    },
    hostName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'HostName'
    },
    horaInicio: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'HoraInicio'
    },
    horaFin: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'HoraFin'
    },
    tiempoEjecucion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'TiempoEjecucion'
    },
    idReporte: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ETLAlerta',
    tableName: 'ETLAlertas'
  });
  return ETLAlerta;
};