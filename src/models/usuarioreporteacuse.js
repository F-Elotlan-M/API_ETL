// src/models/usuarioreporteacuse.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UsuarioReporteAcuse extends Model {
    static associate(models) {
      UsuarioReporteAcuse.belongsTo(models.Usuario, {
        foreignKey: 'idUsuario',
        as: 'usuario'
      });
      UsuarioReporteAcuse.belongsTo(models.Reporte, {
        foreignKey: 'idReporte',
        as: 'reporte'
      });
    }
  }
  UsuarioReporteAcuse.init({
    idUsuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // references: { model: 'Usuarios', key: 'id' } // Ya definido por la asociación
    },
    idReporte: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // references: { model: 'Reportes', key: 'id' } // Ya definido por la asociación
    },
    fechaAcuse: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'UsuarioReporteAcuse',
    tableName: 'UsuarioReporteAcuses',
    indexes: [ // Definir el índice unique también en el modelo
      {
        unique: true,
        fields: ['idUsuario', 'idReporte'],
        name: 'unique_usuario_reporte_acuse_model'
      }
    ]
  });
  return UsuarioReporteAcuse;
};