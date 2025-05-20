// src/migrations/<timestamp>-create-permiso.js
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Permisos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idUsuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Usuarios', // Nombre de la tabla a la que referencia
          key: 'id'          // Columna a la que referencia en la tabla Usuarios
        },
        onUpdate: 'CASCADE', // Si el id del Usuario cambia, actualizar aquí
        onDelete: 'CASCADE'  // Si se elimina un Usuario, eliminar sus permisos
      },
      idEtl: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ETLs', // Nombre de la tabla a la que referencia
          key: 'id'       // Columna a la que referencia en la tabla ETLs
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'   // Si se elimina un ETL, eliminar los permisos asociados
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Añadir una restricción UNIQUE compuesta para evitar permisos duplicados
    // Un usuario no puede tener el mismo ETL asignado dos veces.
    await queryInterface.addConstraint('Permisos', {
      fields: ['idUsuario', 'idEtl'],
      type: 'unique',
      name: 'unique_permiso_usuario_etl' // Nombre opcional para la restricción
    });
  },
  async down(queryInterface, Sequelize) {
    // Remover la restricción antes de eliminar la tabla
    await queryInterface.removeConstraint('Permisos', 'unique_permiso_usuario_etl');
    await queryInterface.dropTable('Permisos');
  }
};