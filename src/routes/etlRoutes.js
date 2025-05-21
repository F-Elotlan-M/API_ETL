// src/routes/etlRoutes.js
const express = require('express');
const router = express.Router();
const etlController = require('../controllers/etlController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware'); // O solo authenticateToken si cualquier usuario logueado puede ver los ETLs

// NUEVA RUTA para CU-02: Listar todos los ETLs
// GET /api/etls
router.get('/', [authenticateToken, isAdmin], etlController.listarETLs); // Protegido para Admin, ajusta si es necesario
//CU-03: Crear un nuevo ETL
router.post('/', [authenticateToken, isAdmin], etlController.crearETL);


module.exports = router;