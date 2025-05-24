// src/models/log.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Log extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here if needed in the future
    }
  }
  Log.init({
    // Los nombres de los campos deben coincidir con los de la migración
    // Sequelize maneja la convención de mayúsculas/minúsculas (camelCase en JS, PascalCase/snake_case en DB)
    // pero es más seguro usar los mismos nombres que en la migración si son PascalCase.
    // Sin embargo, Sequelize por defecto convierte camelCase del modelo a snake_case en la BD.
    // Para que coincida con tu diagrama (PascalCase) y la migración, los especificaremos explícitamente.
    Servicio: { // Si tu columna en la BD se llama 'Servicio'
      type: DataTypes.STRING,
      allowNull: false
    },
    Fecha_Inicio: {
      type: DataTypes.DATE,
      allowNull: false
    },
    Fecha_Fin: {
      type: DataTypes.DATE,
      allowNull: false
    },
    Tiempo_Res: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Peticion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Respuesta: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Ip: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Usuario: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Codigo_Res: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Log',
    tableName: 'Logs' // Asegúrate que coincida con el nombre de tabla en la migración
  });
  return Log;
};