// src/models/usuario.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      // Un Usuario puede tener muchos registros de Permiso
      Usuario.hasMany(models.Permiso, {
        foreignKey: 'idUsuario',
        as: 'permisos' // Alias opcional
      });
    }
  }
  Usuario.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'El nombre de usuario ya está en uso.' // Mensaje de error personalizado
      }
    },
    rol: {
      type: DataTypes.STRING,
      allowNull: true, 
      defaultValue: 'consultor'
    }
  }, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'Usuarios',
  });
  return Usuario;
};