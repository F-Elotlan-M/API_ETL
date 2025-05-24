// src/routes/reporteRoutes.js
const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const { authenticateToken, hasRequiredRole } = require('../middleware/authMiddleware');

// GET /api/reportes/hoy
router.get(
  '/hoy',
  [authenticateToken, hasRequiredRole(['Administrador', 'Consultor'])],
  reporteController.obtenerReportesDelDia
);

router.get(
  '/por-fecha',
  [authenticateToken, hasRequiredRole(['Administrador', 'Consultor'])],
  reporteController.obtenerReportesPorFecha
);

router.post(
  '/procesamiento',
  // SIN MIDDLEWARES DE AUTENTICACIÓN DE USUARIO
  reporteController.registrarReporteProcesamiento
);

router.post(
  '/archivo',
  // SIN MIDDLEWARES DE AUTENTICACIÓN DE USUARIO
  reporteController.registrarReporteArchivo
);

router.post(
  '/alerta',
  // SIN MIDDLEWARES DE AUTENTICACIÓN DE USUARIO
  reporteController.registrarReporteAlerta
);

router.get(
  '/criticos-no-acusados',
  [authenticateToken, hasRequiredRole(['Administrador', 'Consultor'])],
  reporteController.obtenerReportesCriticosNoAcusados
);

router.post(
  '/:idReporte/acusar', // :idReporte será un parámetro de ruta
  [authenticateToken, hasRequiredRole(['Administrador', 'Consultor'])],
  reporteController.acusarReciboReporteCritico
);

module.exports = router;