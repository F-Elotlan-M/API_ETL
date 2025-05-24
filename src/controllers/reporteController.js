// src/controllers/reporteController.js
const { Reporte, ETL, Permiso, Usuario } = require('../models');
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