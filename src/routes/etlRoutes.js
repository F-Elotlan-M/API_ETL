// src/routes/etlRoutes.js
const express = require('express');
const router = express.Router();
const etlController = require('../controllers/etlController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware'); // O solo authenticateToken si cualquier usuario logueado puede ver los ETLs

// NUEVA RUTA para CU-02: Listar todos los ETLs
router.get('/', [authenticateToken, isAdmin], etlController.listarETLs); // Protegido para Admin, ajusta si es necesario

//CU-03: Crear un nuevo ETL
router.post('/', [authenticateToken, isAdmin], etlController.crearETL);

// NUEVA RUTA para CU-04: Obtener un ETL específico por su ID
router.get('/:idEtl', [authenticateToken, isAdmin], etlController.obtenerETLPorId);

// NUEVA RUTA para CU-04: Actualizar un ETL específico por su ID
router.put('/:idEtl', [authenticateToken, isAdmin], etlController.actualizarETL);

// NUEVA RUTA para CU-05: Eliminar un ETL específico por su ID
router.delete('/:idEtl', [authenticateToken, isAdmin], etlController.eliminarETL);

module.exports = router;