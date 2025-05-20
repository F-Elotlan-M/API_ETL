// src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// Verificar que JWT_SECRET esté definido
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET no está definido en las variables de entorno.");
  process.exit(1); // Termina la aplicación si el secreto no está configurado
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']; // Espera "Bearer TOKEN_AQUI"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensaje: 'Acceso denegado. Token no proporcionado.' });
  }

  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ mensaje: 'Acceso denegado. Token expirado.' });
      }
      console.error('Error al verificar token:', err.message);
      return res.status(403).json({ mensaje: 'Acceso denegado. Token inválido.' });
    }

    // El payload del token decodificado se adjunta al objeto request
    // Asumimos que el payload contiene al menos 'id' y 'rol' del usuario
    // ej: { id: 1, nombre: 'Admin User', rol: 'Administrador', iat: ..., exp: ... }
    req.user = userPayload;
    next(); // Pasa al siguiente middleware o al controlador de la ruta
  });
};

const isAdmin = (req, res, next) => {
  // Este middleware debe ejecutarse DESPUÉS de authenticateToken
  if (req.user && req.user.rol === 'Administrador') {
    next(); // El usuario es Administrador, continuar
  } else {
    // Si req.user no existe o el rol no es 'Administrador'
    let mensaje = 'Acceso denegado. Permisos insuficientes.';
    if (req.user) {
      mensaje = `Acceso denegado. Rol '${req.user.rol}' no tiene permisos de Administrador.`;
    }
    return res.status(403).json({ mensaje });
  }
};

module.exports = {
  authenticateToken,
  isAdmin
};