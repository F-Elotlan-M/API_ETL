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