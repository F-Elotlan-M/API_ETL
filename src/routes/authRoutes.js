// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', authController.login);

// Aquí podrías añadir más rutas de autenticación en el futuro (ej. /logout, /refresh-token)

module.exports = router;