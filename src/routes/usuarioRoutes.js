// src/routes/usuarioRoutes.js

const express = require('express');
const router = express.Router(); // Crear una instancia del Router de Express
const usuarioController = require('../controllers/usuarioController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Definir la ruta para agregar un nuevo usuario
// POST /api/usuarios
// Esta ruta estará protegida y solo accesible por Administradores.
// En src/routes/usuarioRoutes.js
// router.post('/', [authenticateToken, isAdmin], usuarioController.agregarUsuario);
router.post('/', usuarioController.agregarUsuario); // Ruta sin protección temporal

// NUEVA RUTA para CU-02: Listar todos los usuarios
// GET /api/usuarios
router.get('/', [authenticateToken, isAdmin], usuarioController.listarUsuarios);
router.get('/:idUsuario/permisos', [authenticateToken, isAdmin], usuarioController.obtenerPermisosDeUsuario);

router.put('/:idUsuario/permisos', [authenticateToken, isAdmin], usuarioController.actualizarPermisosUsuario);
// Aquí podrías agregar más rutas para usuarios en el futuro:
// router.get('/', [authenticateToken, isAdmin], usuarioController.listarUsuarios);
// router.get('/:id', [authenticateToken, isAdmin], usuarioController.obtenerUsuarioPorId);
// router.put('/:id', [authenticateToken, isAdmin], usuarioController.actualizarUsuario);
// router.delete('/:id', [authenticateToken, isAdmin], usuarioController.eliminarUsuario);

module.exports = router; // Exportar el router para usarlo en server.js