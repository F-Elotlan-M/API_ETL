// src/controllers/usuarioController.js

// Importar modelos necesarios y el operador Op de Sequelize
const { Usuario, ETL, Permiso, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.agregarUsuario = async (req, res) => {
  const { nombreUsuario, etlIds } = req.body;

  // 1. Validación de entradas
  if (!nombreUsuario || typeof nombreUsuario !== 'string' || nombreUsuario.trim() === '') {
    return res.status(400).json({ mensaje: 'El campo "nombreUsuario" es requerido y debe ser una cadena de texto.' });
  }
  if (!etlIds || !Array.isArray(etlIds) || etlIds.length === 0) {
    return res.status(400).json({ mensaje: 'El campo "etlIds" es requerido y debe ser un arreglo no vacío de IDs de ETL.' });
  }
  const sonEtlIdsNumerosPositivos = etlIds.every(id => Number.isInteger(id) && id > 0);
  if (!sonEtlIdsNumerosPositivos) {
    return res.status(400).json({ mensaje: 'Todos los IDs en "etlIds" deben ser números enteros positivos.' });
  }

  // Iniciar una transacción de base de datos para asegurar la atomicidad
  const t = await sequelize.transaction();

  try {
    // 2. Verificar que todos los ETLs proporcionados existan en la base de datos
    const etlsExistentes = await ETL.findAll({
      where: {
        id: {
          [Op.in]: etlIds // Busca todos los ETLs cuyos IDs estén en el arreglo etlIds
        }
      },
      transaction: t // Incluir esta consulta en la transacción
    });

    // Si la cantidad de ETLs encontrados no coincide con la cantidad de IDs proporcionados,
    // significa que algunos ETLs no existen.
    if (etlsExistentes.length !== etlIds.length) {
      const idsEncontrados = etlsExistentes.map(e => e.id);
      const idsFaltantes = etlIds.filter(id => !idsEncontrados.includes(id));
      await t.rollback(); // Revertir la transacción
      return res.status(400).json({
        mensaje: `No se pudo agregar el usuario porque uno o más ETLs no existen. IDs de ETLs no encontrados: ${idsFaltantes.join(', ')}.`
      });
    }

    // 3. Intentar crear el nuevo usuario en la base de datos
    let nuevoUsuario;
    try {
      nuevoUsuario = await Usuario.create({
        nombre: nombreUsuario.trim()
      }, { transaction: t }); // Incluir esta operación en la transacción
    } catch (error) {
      await t.rollback(); // Revertir la transacción
      if (error.name === 'SequelizeUniqueConstraintError') {
        // Este error es específico de Sequelize cuando una restricción 'unique' falla
        return res.status(409).json({ mensaje: `El nombre de usuario '${nombreUsuario.trim()}' ya está en uso. Por favor, elige otro.` });
      }
      // Para otros errores durante la creación del usuario
      console.error("Error al crear el usuario en la BD:", error);
      return res.status(500).json({ mensaje: 'Error interno del servidor al intentar crear el usuario.' });
    }

    // 4. Si el usuario se creó correctamente, asignar los permisos (crear entradas en la tabla Permiso)
    const permisosParaCrear = etlIds.map(idEtl => {
      return {
        idUsuario: nuevoUsuario.id,
        idEtl: idEtl
      };
    });

    // Usar bulkCreate para insertar múltiples registros de permiso eficientemente
    await Permiso.bulkCreate(permisosParaCrear, { transaction: t }); // Incluir en la transacción

    // 5. Si todas las operaciones fueron exitosas, confirmar la transacción
    await t.commit();

    // 6. Enviar respuesta de éxito
    return res.status(201).json({
      idUsuario: nuevoUsuario.id,
      nombreUsuario: nuevoUsuario.nombre,
      etlIdsAsignados: etlIds,
      mensaje: 'Usuario agregado y permisos asignados exitosamente.'
    });

  } catch (error) {
    // Si ocurre cualquier error no manejado durante el proceso, revertir la transacción
    // (si no ha sido ya revertida o confirmada)
    if (t && !t.finished) { // t.finished será 'commit' o 'rollback' si ya se ejecutó
      try {
        await t.rollback();
      } catch (rollbackError) {
        // Loggear el error de rollback si es necesario, pero el error original es más importante
        console.error('Error al intentar hacer rollback de la transacción:', rollbackError);
      }
    }
    console.error("Error general en el controlador agregarUsuario:", error);
    return res.status(500).json({ mensaje: 'Ocurrió un error inesperado en el servidor.' });
  }
};

// Aquí podrías agregar más funciones para otros CUs (listar usuarios, actualizar, etc.)
// exports.listarUsuarios = async (req, res) => { /* ... */ };