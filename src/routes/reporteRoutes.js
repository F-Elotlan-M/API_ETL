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

module.exports = router;