// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { decryptText } = require('../utils/encryptionUtils'); // Asegúrate que la ruta sea correcta
const JWT_SECRET = process.env.JWT_SECRET;

// Verificar que JWT_SECRET esté definido al inicio del módulo
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET no está definido en las variables de entorno.");
  process.exit(1);
}

// Definimos authenticateToken como una constante
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const tokenEnHeader = authHeader && authHeader.split(' ')[1];

  if (!tokenEnHeader) {
    return res.status(401).json({ mensaje: 'Acceso denegado. Token no proporcionado.' });
  }

  let tokenJWT;
  try {
    tokenJWT = decryptText(tokenEnHeader); // Desencriptamos el token
    if (!tokenJWT) {
      throw new Error('Token encriptado inválido o no pudo ser desencriptado.');
    }
  } catch (decryptionError) {
    console.error('Error al desencriptar token:', decryptionError.message);
    return res.status(403).json({ mensaje: 'Acceso denegado. Token con formato incorrecto o corrupto.' });
  }

  jwt.verify(tokenJWT, JWT_SECRET, (err, userPayload) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ mensaje: 'Acceso denegado. Token expirado.' });
      }
      console.error('Error al verificar el token JWT (después de desencriptar):', err.message);
      return res.status(403).json({ mensaje: 'Acceso denegado. Token inválido o expirado.' });
    }
    req.user = userPayload; // Adjuntamos el payload del usuario a la solicitud
    next();
  });
};

// Definimos isAdmin como una constante
const isAdmin = (req, res, next) => {
  // Este middleware asume que authenticateToken se ejecutó antes y req.user está disponible
  if (req.user && req.user.rol === 'Administrador') {
    next();
  } else {
    let mensaje = 'Acceso denegado. Permisos insuficientes.';
    if (req.user && req.user.rol) { // Verificar si req.user.rol existe
      mensaje = `Acceso denegado. Rol '${req.user.rol}' no tiene permisos de Administrador.`;
    } else if (req.user) {
      mensaje = `Acceso denegado. Rol no definido para el usuario. Se requieren permisos de Administrador.`;
    }
    return res.status(403).json({ mensaje });
  }
};

// Definimos hasRequiredRole como una constante
const hasRequiredRole = (allowedRoles) => { // allowedRoles es un array de strings
  return (req, res, next) => {
    // Este middleware asume que authenticateToken se ejecutó antes y req.user está disponible
    if (!req.user || !req.user.rol) {
      return res.status(403).json({ mensaje: 'Acceso denegado: Información de rol no disponible en el token.' });
    }

    if (allowedRoles.includes(req.user.rol)) {
      next(); // El rol del usuario está en la lista de roles permitidos
    } else {
      return res.status(403).json({ mensaje: `Acceso denegado: Su rol ('${req.user.rol}') no tiene permiso. Requiere uno de los siguientes roles: ${allowedRoles.join(', ')}.` });
    }
  };
};

// Exportamos las funciones
module.exports = {
  authenticateToken,
  isAdmin,
  hasRequiredRole
};