// src/models/permiso.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Permiso extends Model {
    static associate(models) {
      // Un Permiso pertenece a un Usuario
      Permiso.belongsTo(models.Usuario, {
        foreignKey: 'idUsuario',
        as: 'usuario' // Alias opcional
      });
      // Un Permiso pertenece a un ETL
      Permiso.belongsTo(models.ETL, {
        foreignKey: 'idEtl',
        as: 'etl' // Alias opcional
      });
    }
  }
  Permiso.init({
    // idUsuario e idEtl ya están definidos como atributos y foreign keys
    // No es necesario redefinirlos aquí a menos que quieras añadir validaciones específicas a nivel de modelo
    idUsuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // La validación de FK ya está en la migración
    },
    idEtl: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // La validación de FK ya está en la migración
    }
  }, {
    sequelize,
    modelName: 'Permiso',
    tableName: 'Permisos',
    // Asegurar que el índice unique también se defina a nivel de modelo
    // para que Sequelize lo conozca y pueda generar errores más descriptivos.
    indexes: [
      {
        unique: true,
        fields: ['idUsuario', 'idEtl'],
        name: 'unique_permiso_usuario_etl_model' // Diferente nombre del de la migración si quieres
      }
    ]
  });
  return Permiso;
};