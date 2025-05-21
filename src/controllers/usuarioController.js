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

exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre', 'createdAt', 'updatedAt'] // Selecciona los campos que quieres devolver
    });
    return res.status(200).json(usuarios);
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    return res.status(500).json({ mensaje: 'Error interno del servidor al listar usuarios.' });
  }
};

exports.obtenerPermisosDeUsuario = async (req, res) => {
  const { idUsuario } = req.params;

  try {
    const usuario = await Usuario.findByPk(idUsuario, {
      attributes: ['id', 'nombre'], // Tomamos id y nombre del usuario
      include: [{
        model: Permiso,
        as: 'permisos', // El alias que definimos en la asociación Usuario <-> Permiso
        attributes: ['id'], // El id del permiso en sí
        include: [{
          model: ETL,
          as: 'etl', // El alias que definimos en la asociación Permiso <-> ETL
          attributes: ['id', 'nombre', 'descripcion', 'tipo'] // Datos del ETL asociado
        }]
      }]
    });

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    // Formatear la respuesta para que sea más útil para el frontend
    const respuestaFormateada = {
      idUsuario: usuario.id,
      nombreUsuario: usuario.nombre,
      permisos: usuario.permisos.map(p => ({
        idPermiso: p.id,
        idEtl: p.etl.id,
        nombreEtl: p.etl.nombre,
        descripcionEtl: p.etl.descripcion,
        tipoEtl: p.etl.tipo
      }))
    };

    return res.status(200).json(respuestaFormateada);
  } catch (error) {
    console.error(`Error al obtener permisos del usuario ${idUsuario}:`, error);
    return res.status(500).json({ mensaje: 'Error interno del servidor al obtener los permisos del usuario.' });
  }
};

exports.actualizarPermisosUsuario = async (req, res) => {
  const { idUsuario } = req.params;
  const { etlIds } = req.body; // Se espera un array de IDs de ETL

  // Validación de entrada
  if (!Array.isArray(etlIds)) {
    return res.status(400).json({ mensaje: 'El cuerpo de la solicitud debe contener un arreglo "etlIds".' });
  }
  const sonEtlIdsNumerosPositivos = etlIds.every(id => Number.isInteger(id) && id > 0);
  if (etlIds.length > 0 && !sonEtlIdsNumerosPositivos) { // Permitir array vacío para quitar todos los permisos
    return res.status(400).json({ mensaje: 'Si se proporcionan, todos los IDs en "etlIds" deben ser números enteros positivos.' });
  }

  const t = await sequelize.transaction(); // Iniciar transacción

  try {
    // 1. Verificar que el usuario exista
    const usuario = await Usuario.findByPk(idUsuario, { transaction: t });
    if (!usuario) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    // 2. Verificar que todos los ETLs proporcionados (si los hay) existan
    if (etlIds.length > 0) {
      const etlsExistentes = await ETL.findAll({
        where: { id: { [Op.in]: etlIds } },
        attributes: ['id'],
        transaction: t
      });

      if (etlsExistentes.length !== etlIds.length) {
        const idsEncontrados = etlsExistentes.map(e => e.id);
        const idsFaltantes = etlIds.filter(id => !idsEncontrados.includes(id));
        await t.rollback();
        return res.status(400).json({ mensaje: `Los siguientes ETLs IDs no existen: ${idsFaltantes.join(', ')}.` });
      }
    }

    // 3. Borrar todos los permisos existentes para este usuario
    await Permiso.destroy({
      where: { idUsuario: idUsuario },
      transaction: t
    });

    // 4. Si se proporcionaron etlIds, crear los nuevos permisos
    if (etlIds.length > 0) {
      const nuevosPermisos = etlIds.map(idEtl => ({
        idUsuario: parseInt(idUsuario), // Asegurarse que sea número
        idEtl: idEtl
      }));
      await Permiso.bulkCreate(nuevosPermisos, { transaction: t });
    }

    // 5. Confirmar la transacción
    await t.commit();

    return res.status(200).json({
      idUsuario: parseInt(idUsuario),
      etlIdsAsignados: etlIds,
      mensaje: 'Permisos actualizados correctamente.'
    });

  } catch (error) {
    if (t) await t.rollback(); // Asegurarse de rollback si hay error y la transacción existe
    console.error(`Error al actualizar permisos del usuario ${idUsuario}:`, error);
    return res.status(500).json({ mensaje: 'Error interno del servidor al actualizar los permisos.' });
  }
};