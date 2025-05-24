// src/models/etlprocesamiento.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ETLProcesamiento extends Model {
    static associate(models) {
      // Un ETLProcesamiento pertenece a un Reporte
      ETLProcesamiento.belongsTo(models.Reporte, {
        foreignKey: 'idReporte',
        as: 'reporte', // Alias para la asociación
        onDelete: 'CASCADE', // Coincide con la migración
        onUpdate: 'CASCADE'
      });
    }
  }
  ETLProcesamiento.init({
    // Nombres de atributos en camelCase que mapean a PascalCase/snake_case en BD
    // o usa los mismos nombres PascalCase si así lo prefieres y configuras 'field'
    nombre: { // Mapea a 'Nombre' en la BD si no se especifica 'field' y no hay 'underscored: true' global
      type: DataTypes.STRING,
      allowNull: false,
      field: 'Nombre' // Especificar el nombre exacto de la columna si es diferente a la convención
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'Fecha'
    },
    nombreArchivo: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'NombreArchivo'
    },
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
    idReporte: { // La FK se maneja por la asociación, pero se puede definir
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ETLProcesamiento',
    tableName: 'ETLProcesamientos', // Nombre de la tabla
    // Si tus columnas en la BD son PascalCase como en la migración,
    // y quieres que los atributos del modelo también sean PascalCase, defínelos así.
    // Si prefieres atributos camelCase en el modelo, usa la opción `field` como arriba
    // para mapear al nombre de columna PascalCase.
    // Por consistencia con otros modelos, usar PascalCase para atributos aquí puede ser más simple si tus columnas son PascalCase.
    // Alternativamente, si quieres que Sequelize maneje todo como snake_case en la BD:
    // sequelize.options.define.underscored = true; (globalmente)
    // Y en las migraciones usarías nombres snake_case para las columnas.
    // Para este ejemplo, usaré `field` para mapear atributos camelCase del modelo a columnas PascalCase.
  });
  return ETLProcesamiento;
};