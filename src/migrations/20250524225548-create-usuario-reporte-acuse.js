// src/migrations/<timestamp>-create-usuario-reporte-acuse.js
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UsuarioReporteAcuses', { // Sequelize pluraliza
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
          model: 'Usuarios', // Nombre de tu tabla de Usuarios
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Si se borra el usuario, se borran sus acuses
      },
      idReporte: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Reportes', // Nombre de tu tabla de Reportes
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Si se borra el reporte, se borra el acuse (importante)
      },
      fechaAcuse: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
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

    // Añadir una restricción UNIQUE compuesta para evitar duplicados
    await queryInterface.addConstraint('UsuarioReporteAcuses', {
      fields: ['idUsuario', 'idReporte'],
      type: 'unique',
      name: 'unique_usuario_reporte_acuse'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('UsuarioReporteAcuses', 'unique_usuario_reporte_acuse');
    await queryInterface.dropTable('UsuarioReporteAcuses');
  }
};