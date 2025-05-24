// src/controllers/reporteController.js
const { Reporte, ETL, Permiso, Usuario, ETLProcesamiento, ETLArchivo, ETLAlerta, UsuarioReporteAcuse, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.obtenerReportesDelDia = async (req, res) => {
  const usuarioAutenticado = req.user;

  try {
    const hoyInicio = new Date();
    hoyInicio.setHours(0, 0, 0, 0);
    const hoyFin = new Date();
    hoyFin.setHours(23, 59, 59, 999);

    const whereClauseReporte = {
      FechaReporte: { // Usando PascalCase como en el modelo
        [Op.gte]: hoyInicio,
        [Op.lte]: hoyFin
      }
    };

    if (usuarioAutenticado.rol === 'Consultor') {
      const permisos = await Permiso.findAll({
        where: { idUsuario: usuarioAutenticado.id },
        attributes: ['idEtl']
      });
      if (!permisos || permisos.length === 0) {
        return res.status(200).json([]);
      }
      const etlIdsPermitidos = permisos.map(p => p.idEtl);
      whereClauseReporte.idEtl = { [Op.in]: etlIdsPermitidos };
    } else if (usuarioAutenticado.rol !== 'Administrador') {
      return res.status(403).json({ mensaje: 'Rol no autorizado para esta acción.' });
    }

    const reportesDelDia = await Reporte.findAll({
      where: whereClauseReporte,
      include: [{
        model: ETL,
        as: 'etl',
        attributes: ['id', 'nombre', 'tipo']
      }],
      order: [
        ['FechaReporte', 'DESC'], // <--- CORREGIDO a PascalCase
        [{ model: ETL, as: 'etl' }, 'nombre', 'ASC']
      ],
      // Especifica los atributos del modelo Reporte usando sus nombres definidos en el modelo
      attributes: ['id', 'FechaReporte', 'Status', 'idEtl'] // <--- CORREGIDO a PascalCase
    });

    const respuestaFormateada = reportesDelDia.map(r => ({
      idReporte: r.id,
      fechaReporte: r.FechaReporte, // <--- CORREGIDO: Accede usando el nombre del atributo del modelo
      statusReporte: r.Status,     // <--- CORREGIDO: Accede usando el nombre del atributo del modelo
      etl: r.etl ? {
        idEtl: r.etl.id,
        nombreEtl: r.etl.nombre,
        tipoEtl: r.etl.tipo
      } : null
    }));

    return res.status(200).json(respuestaFormateada);
  } catch (error) {
    console.error("Error al obtener los reportes del día:", error);
    // Imprimir el error SQL original si existe, para más detalles en el log del servidor
    if (error.original) {
      console.error("Error SQL original:", error.original.sql);
      console.error("Parámetros SQL:", error.original.parameters);
    }
    return res.status(500).json({ mensaje: 'Error interno del servidor al obtener los reportes.' });
  }
};

exports.obtenerReportesPorFecha = async (req, res) => {
  const { fecha } = req.query; // Obtener la fecha del query parameter
  const usuarioAutenticado = req.user; // { id, nombre, rol }

  // 1. Validar el parámetro 'fecha'
  if (!fecha) {
    return res.status(400).json({ mensaje: 'El parámetro "fecha" (YYYY-MM-DD) es requerido.' });
  }

  // Validar formato YYYY-MM-DD (expresión regular simple)
  const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
  if (!regexFecha.test(fecha)) {
    return res.status(400).json({ mensaje: 'El formato de "fecha" debe ser YYYY-MM-DD.' });
  }

  // 2. Convertir la fecha string a objeto Date y calcular rango del día
  // ¡Importante! Esto usa la zona horaria del servidor.
  // new Date('YYYY-MM-DD') se interpreta como YYYY-MM-DD a las 00:00:00 en UTC.
  // Para interpretar como 00:00:00 en la zona horaria local del servidor, podemos añadir T00:00:00
  const fechaConsultada = new Date(fecha + 'T00:00:00'); 
  if (isNaN(fechaConsultada.getTime())) {
      return res.status(400).json({ mensaje: 'La fecha proporcionada no es válida.' });
  }

  const inicioDelDia = new Date(fechaConsultada);
  inicioDelDia.setHours(0, 0, 0, 0);

  const finDelDia = new Date(fechaConsultada);
  finDelDia.setHours(23, 59, 59, 999);

  try {
    // 3. Construir la cláusula 'where' base para los reportes
    const whereClauseReporte = {
      FechaReporte: { // Asegúrate que coincida con el nombre del atributo en tu modelo Reporte
        [Op.gte]: inicioDelDia,
        [Op.lte]: finDelDia
      }
    };

    // 4. Si el usuario es Consultor, filtrar por ETLs permitidos
    if (usuarioAutenticado.rol === 'Consultor') {
      const permisos = await Permiso.findAll({
        where: { idUsuario: usuarioAutenticado.id },
        attributes: ['idEtl']
      });

      if (!permisos || permisos.length === 0) {
        return res.status(200).json([]); // Consultor sin permisos, devuelve array vacío
      }
      const etlIdsPermitidos = permisos.map(p => p.idEtl);
      whereClauseReporte.idEtl = { [Op.in]: etlIdsPermitidos };
    } else if (usuarioAutenticado.rol !== 'Administrador') {
      return res.status(403).json({ mensaje: 'Rol no autorizado para esta acción.' });
    }
    // Los Administradores no tienen el filtro de idEtl adicional.

    // 5. Obtener los reportes para la fecha especificada
    const reportesDelDiaEspecificado = await Reporte.findAll({
      where: whereClauseReporte,
      include: [{
        model: ETL,
        as: 'etl', // Alias de la asociación Reporte.belongsTo(ETL)
        attributes: ['id', 'nombre', 'tipo']
      }],
      order: [
        ['FechaReporte', 'DESC'], // Los más recientes de ese día primero
        [{ model: ETL, as: 'etl' }, 'nombre', 'ASC']
      ],
      attributes: ['id', 'FechaReporte', 'Status', 'idEtl'] // Usar PascalCase como en el modelo
    });

    // 6. Formatear la respuesta (igual que en CU-06)
    const respuestaFormateada = reportesDelDiaEspecificado.map(r => ({
      idReporte: r.id,
      fechaReporte: r.FechaReporte, // Usar PascalCase
      statusReporte: r.Status,     // Usar PascalCase
      etl: r.etl ? {
        idEtl: r.etl.id,
        nombreEtl: r.etl.nombre,
        tipoEtl: r.etl.tipo
      } : null
    }));

    // Si no se encuentran reportes, se devuelve un array vacío (200 OK).
    // El frontend se encargará de mostrar el mensaje "No existe ningún reporte..." (EX-01)
    return res.status(200).json(respuestaFormateada);

  } catch (error) {
    console.error(`Error al obtener los reportes para la fecha ${fecha}:`, error);
    return res.status(500).json({ mensaje: 'Error interno del servidor al obtener los reportes.' });
  }
};

exports.registrarReporteProcesamiento = async (req, res) => {
  const { idEtl, fechaReporte, statusGeneral, detalleProcesamiento } = req.body;

  // 1. Validaciones de entrada básicas
  if (!idEtl || !fechaReporte || !statusGeneral || !detalleProcesamiento) {
    return res.status(400).json({ mensaje: 'Faltan campos requeridos: idEtl, fechaReporte, statusGeneral, o detalleProcesamiento.' });
  }
  if (typeof idEtl !== 'number' || !Number.isInteger(idEtl)) {
    return res.status(400).json({ mensaje: 'idEtl debe ser un número entero.' });
  }
  if (isNaN(new Date(fechaReporte).getTime())) {
    return res.status(400).json({ mensaje: 'fechaReporte no es una fecha válida.' });
  }
  if (typeof detalleProcesamiento !== 'object' || detalleProcesamiento === null) {
    return res.status(400).json({ mensaje: 'detalleProcesamiento debe ser un objeto.'});
  }
  // Validaciones para campos dentro de detalleProcesamiento
  const { nombre, fecha, status } = detalleProcesamiento; // NombreArchivo y Mensaje son opcionales
  if (!nombre || !fecha || !status) {
    return res.status(400).json({ mensaje: 'Campos requeridos en detalleProcesamiento: nombre, fecha, status.' });
  }
  if (isNaN(new Date(fecha).getTime())) {
    return res.status(400).json({ mensaje: 'detalleProcesamiento.fecha no es una fecha válida.' });
  }

  const t = await sequelize.transaction(); // Iniciar transacción

  try {
    // 2. Verificar que el ETL exista
    const etlExistente = await ETL.findByPk(idEtl, { transaction: t });
    if (!etlExistente) {
      await t.rollback();
      return res.status(404).json({ mensaje: `ETL con ID ${idEtl} no encontrado.` });
    }

    // 3. Crear el registro en la tabla Reporte
    const nuevoReporte = await Reporte.create({
      idEtl,
      FechaReporte: new Date(fechaReporte),
      Status: statusGeneral
    }, { transaction: t });

    // 4. Crear el registro en la tabla ETLProcesamiento
    const nuevoDetalle = await ETLProcesamiento.create({
      idReporte: nuevoReporte.id,
      nombre: detalleProcesamiento.nombre,
      fecha: new Date(detalleProcesamiento.fecha),
      nombreArchivo: detalleProcesamiento.nombreArchivo || null,
      status: detalleProcesamiento.status,
      mensaje: detalleProcesamiento.mensaje || null
    }, { transaction: t });

    // 5. Confirmar la transacción
    await t.commit();

    return res.status(201).json({
      mensaje: 'Reporte de procesamiento registrado exitosamente.',
      idReporte: nuevoReporte.id,
      idDetalleProcesamiento: nuevoDetalle.id
    });

  } catch (error) {
    if (t) await t.rollback(); // Revertir transacción si hubo error
    console.error("Error al registrar reporte de procesamiento:", error);
    return res.status(500).json({ mensaje: 'Error interno del servidor al registrar el reporte.' });
  }
};

exports.registrarReporteArchivo = async (req, res) => {
  const { idEtl, fechaReporte, statusGeneral, detalleArchivo } = req.body;

  // 1. Validaciones de entrada
  if (!idEtl || !fechaReporte || !statusGeneral || !detalleArchivo) {
    return res.status(400).json({ mensaje: 'Faltan campos requeridos: idEtl, fechaReporte, statusGeneral, o detalleArchivo.' });
  }
  if (typeof idEtl !== 'number' || !Number.isInteger(idEtl)) {
    return res.status(400).json({ mensaje: 'idEtl debe ser un número entero.' });
  }
  if (isNaN(new Date(fechaReporte).getTime())) {
    return res.status(400).json({ mensaje: 'fechaReporte no es una fecha válida.' });
  }
  if (typeof detalleArchivo !== 'object' || detalleArchivo === null) {
    return res.status(400).json({ mensaje: 'detalleArchivo debe ser un objeto.'});
  }
  const { status } = detalleArchivo; // Mensaje es opcional en ETLArchivo
  if (!status) {
    return res.status(400).json({ mensaje: 'Campo requerido en detalleArchivo: status.' });
  }

  const t = await sequelize.transaction();

  try {
    // 2. Verificar que el ETL exista
    const etlExistente = await ETL.findByPk(idEtl, { transaction: t });
    if (!etlExistente) {
      await t.rollback();
      return res.status(404).json({ mensaje: `ETL con ID ${idEtl} no encontrado.` });
    }

    // 3. Crear el registro en la tabla Reporte
    const nuevoReporte = await Reporte.create({
      idEtl,
      FechaReporte: new Date(fechaReporte),
      Status: statusGeneral
    }, { transaction: t });

    // 4. Crear el registro en la tabla ETLArchivo
    const nuevoDetalle = await ETLArchivo.create({
      idReporte: nuevoReporte.id,
      status: detalleArchivo.status, // Mapea a 'Status' en BD por el 'field' en el modelo
      mensaje: detalleArchivo.mensaje || null // Mapea a 'Mensaje'
    }, { transaction: t });

    // 5. Confirmar la transacción
    await t.commit();

    return res.status(201).json({
      mensaje: 'Reporte de archivo registrado exitosamente.',
      idReporte: nuevoReporte.id,
      idDetalleArchivo: nuevoDetalle.id
    });

  } catch (error) {
    if (t) await t.rollback();
    console.error("Error al registrar reporte de archivo:", error);
    return res.status(500).json({ mensaje: 'Error interno del servidor al registrar el reporte.' });
  }
};

exports.registrarReporteAlerta = async (req, res) => {
  const { idEtl, fechaReporte, statusGeneral, detalleAlerta } = req.body;

  // 1. Validaciones de entrada
  if (!idEtl || !fechaReporte || !statusGeneral || !detalleAlerta) {
    return res.status(400).json({ mensaje: 'Faltan campos requeridos: idEtl, fechaReporte, statusGeneral, o detalleAlerta.' });
  }
  if (typeof idEtl !== 'number' || !Number.isInteger(idEtl)) {
    return res.status(400).json({ mensaje: 'idEtl debe ser un número entero.' });
  }
  if (isNaN(new Date(fechaReporte).getTime())) {
    return res.status(400).json({ mensaje: 'fechaReporte no es una fecha válida.' });
  }
  if (typeof detalleAlerta !== 'object' || detalleAlerta === null) {
    return res.status(400).json({ mensaje: 'detalleAlerta debe ser un objeto.'});
  }
  const { nombre, horaInicio, horaFin } = detalleAlerta; // HostName y TiempoEjecucion son opcionales
  if (!nombre || !horaInicio || !horaFin) {
    return res.status(400).json({ mensaje: 'Campos requeridos en detalleAlerta: nombre, horaInicio, horaFin.' });
  }
  if (isNaN(new Date(horaInicio).getTime()) || isNaN(new Date(horaFin).getTime())) {
    return res.status(400).json({ mensaje: 'horaInicio o horaFin en detalleAlerta no son fechas válidas.' });
  }
  if (detalleAlerta.tiempoEjecucion && typeof detalleAlerta.tiempoEjecucion !== 'number') {
      return res.status(400).json({ mensaje: 'Si se proporciona, tiempoEjecucion debe ser un número (milisegundos).'});
  }


  const t = await sequelize.transaction();

  try {
    // 2. Verificar que el ETL exista
    const etlExistente = await ETL.findByPk(idEtl, { transaction: t });
    if (!etlExistente) {
      await t.rollback();
      return res.status(404).json({ mensaje: `ETL con ID ${idEtl} no encontrado.` });
    }

    // 3. Crear el registro en la tabla Reporte
    const nuevoReporte = await Reporte.create({
      idEtl,
      FechaReporte: new Date(fechaReporte),
      Status: statusGeneral
    }, { transaction: t });

    // 4. Crear el registro en la tabla ETLAlerta
    const nuevoDetalle = await ETLAlerta.create({
      idReporte: nuevoReporte.id,
      nombre: detalleAlerta.nombre,
      hostName: detalleAlerta.hostName || null,
      horaInicio: new Date(detalleAlerta.horaInicio),
      horaFin: new Date(detalleAlerta.horaFin),
      tiempoEjecucion: detalleAlerta.tiempoEjecucion || null
    }, { transaction: t });

    // 5. Confirmar la transacción
    await t.commit();

    return res.status(201).json({
      mensaje: 'Reporte de alerta/ejecución registrado exitosamente.',
      idReporte: nuevoReporte.id,
      idDetalleAlerta: nuevoDetalle.id
    });

  } catch (error) {
    if (t) await t.rollback();
    console.error("Error al registrar reporte de alerta:", error);
    return res.status(500).json({ mensaje: 'Error interno del servidor al registrar el reporte.' });
  }
};

exports.obtenerReportesCriticosNoAcusados = async (req, res) => {
  const usuarioAutenticado = req.user; // { id, nombre, rol }

  try {
    // 1. Obtener los IDs de los reportes que este usuario ya ha acusado
    const acusesExistentes = await UsuarioReporteAcuse.findAll({
      where: { idUsuario: usuarioAutenticado.id },
      attributes: ['idReporte']
    });
    const idsReportesAcusados = acusesExistentes.map(acuse => acuse.idReporte);

    // 2. Construir la cláusula 'where' base para los reportes críticos
    const whereClauseReporte = {
      Status: 'Fallido Crítico', // Condición para fallo crítico
      id: { [Op.notIn]: idsReportesAcusados } // Excluir los ya acusados
    };

    // 3. Si el usuario es Consultor, filtrar por ETLs permitidos
    if (usuarioAutenticado.rol === 'Consultor') {
      const permisos = await Permiso.findAll({
        where: { idUsuario: usuarioAutenticado.id },
        attributes: ['idEtl']
      });

      if (!permisos || permisos.length === 0) {
        return res.status(200).json([]); // Consultor sin permisos para ningún ETL
      }
      const etlIdsPermitidos = permisos.map(p => p.idEtl);
      whereClauseReporte.idEtl = { [Op.in]: etlIdsPermitidos };
    } else if (usuarioAutenticado.rol !== 'Administrador') {
      return res.status(403).json({ mensaje: 'Rol no autorizado para esta acción.' });
    }
    // Los Administradores ven todos los reportes críticos no acusados por ellos.

    // 4. Obtener los reportes críticos no acusados
    const reportesCriticos = await Reporte.findAll({
      where: whereClauseReporte,
      include: [{
        model: ETL,
        as: 'etl',
        attributes: ['id', 'nombre', 'tipo']
      }],
      order: [['FechaReporte', 'DESC']], // Mostrar los más recientes primero
      attributes: ['id', 'FechaReporte', 'Status', 'idEtl']
    });

    // 5. Formatear la respuesta
    const respuestaFormateada = reportesCriticos.map(r => ({
      idReporte: r.id,
      fechaReporte: r.FechaReporte,
      statusReporte: r.Status,
      etl: r.etl ? {
        idEtl: r.etl.id,
        nombreEtl: r.etl.nombre,
        tipoEtl: r.etl.tipo
      } : null,
      // Mensaje para la GUI como lo describe el CU
      mensajeParaDialogo: r.etl ? `Alerta crítica: Se ha detectado un fallo crítico en el ETL ${r.etl.nombre}` : 'Alerta crítica: Fallo crítico detectado.'
    }));

    return res.status(200).json(respuestaFormateada);

  } catch (error) {
    console.error("Error al obtener reportes críticos no acusados:", error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

exports.acusarReciboReporteCritico = async (req, res) => {
  const { idReporte } = req.params;
  const idUsuario = req.user.id; // ID del usuario autenticado

  try {
    // 1. Verificar que el reporte exista y sea realmente crítico (opcional pero recomendado)
    const reporte = await Reporte.findOne({
      where: {
        id: idReporte,
        Status: 'Fallido Crítico' // Asegurarse que es un reporte que debería ser acusado
      }
    });

    if (!reporte) {
      return res.status(404).json({ mensaje: `Reporte crítico con ID ${idReporte} no encontrado o ya no es crítico.` });
    }

    // 2. Intentar crear el acuse de recibo.
    // findOrCreate para evitar errores si ya existe (ej. por doble clic del usuario)
    // La restricción unique en la BD también protege contra duplicados.
    const [acuse, creado] = await UsuarioReporteAcuse.findOrCreate({
      where: { idUsuario: idUsuario, idReporte: parseInt(idReporte) },
      defaults: {
        idUsuario: idUsuario,
        idReporte: parseInt(idReporte),
        fechaAcuse: new Date()
      }
    });

    if (creado) {
      return res.status(201).json({ mensaje: `Acuse de recibo para el reporte ID ${idReporte} registrado exitosamente.` });
    } else {
      return res.status(200).json({ mensaje: `Ya habías acusado recibo para el reporte ID ${idReporte}.` });
    }

  } catch (error) {
    // Podría haber un error si el idReporte no es un entero válido, etc.
    if (error.name === 'SequelizeForeignKeyConstraintError') {
         return res.status(404).json({ mensaje: `El reporte con ID ${idReporte} o el usuario no existen.` });
    }
    console.error(`Error al acusar recibo del reporte ID ${idReporte}:`, error);
    return res.status(500).json({ mensaje: 'Error interno del servidor al registrar el acuse de recibo.' });
  }
};