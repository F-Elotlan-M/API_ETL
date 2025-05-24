// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const { Usuario, Permiso } = require('../models'); // Nuestros modelos Sequelize
const { checkUserInDA } = require('../utils/daSimulator'); // El simulador de DA
const { encryptText } = require('../utils/encryptionUtils'); // La función de encriptación

const JWT_SECRET = process.env.JWT_SECRET;
// Define un tiempo de expiración por defecto si no está en .env, ej: 8 horas
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h'; 

// Verificación de JWT_SECRET al inicio del módulo
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET no está definido en las variables de entorno para la firma de tokens.");
  // En un entorno real, podrías querer que la aplicación no inicie si falta esta variable crítica.
  // process.exit(1); // Descomenta si quieres que la app termine si JWT_SECRET falta.
}

exports.login = async (req, res) => {
  const { nombreUsuario } = req.body;

  // 1. Validación de entrada
  if (!nombreUsuario || typeof nombreUsuario !== 'string' || nombreUsuario.trim() === '') {
    // loggingMiddleware registrará esta solicitud con código 400
    return res.status(400).json({ mensaje: 'El campo "nombreUsuario" es requerido.' });
  }

  const trimmedNombreUsuario = nombreUsuario.trim();

  try {
    // 2. Simular Verificación en Directorio Activo (DA)
    const existeEnDA = await checkUserInDA(trimmedNombreUsuario);
    if (!existeEnDA) {
      // loggingMiddleware registrará esta solicitud con código 401
      return res.status(401).json({ mensaje: 'Credenciales inválidas. Usuario o contraseña incorrectos.' });
      // Usamos un mensaje genérico para no revelar si el usuario existe o no en el DA.
    }

    // 3. Si existe en DA, buscar en la Base de Datos Local
    const usuarioLocal = await Usuario.findOne({ where: { nombre: trimmedNombreUsuario } });

    if (!usuarioLocal) {
      // Usuario SÍ existe en DA, PERO NO existe en la tabla Usuarios local
      // loggingMiddleware registrará esta solicitud con código 403
      return res.status(403).json({ mensaje: 'Usuario autenticado por el directorio, pero no registrado o sin acceso en esta aplicación.' });
    }

    // 4. Verificar Rol y Permisos Locales
    const { id, nombre, rol } = usuarioLocal; // Atributos del modelo Usuario (nombre, rol)

    let accesoConcedido = false;

    if (rol === 'Administrador') {
      accesoConcedido = true;
    } else if (rol === 'Consultor') {
      // Verificar si tiene al menos un permiso asignado en la tabla Permiso
      const permisoAsignado = await Permiso.findOne({ where: { idUsuario: id } });
      if (permisoAsignado) {
        accesoConcedido = true;
      } else {
        // Usuario SÍ existe en DA, es Consultor, PERO NO tiene permisos ETL
        // loggingMiddleware registrará esta solicitud con código 403
        return res.status(403).json({ mensaje: 'Usuario autenticado, pero no tiene permisos ETL asignados en el sistema.' });
      }
    } else {
      // Rol no válido o nulo (y no es Administrador)
      // loggingMiddleware registrará esta solicitud con código 403
      return res.status(403).json({ mensaje: 'El rol del usuario no permite el acceso al sistema.' });
    }

    if (!accesoConcedido) {
        // Este caso no debería alcanzarse si la lógica anterior es completa, pero es una salvaguarda.
        return res.status(403).json({ mensaje: 'Acceso denegado por política de permisos.'})
    }

    // 5. Generación de Token JWT (si el acceso fue concedido)
    const payload = {
      id: id,         // id del usuario en nuestra BD
      nombre: nombre, // nombre del usuario en nuestra BD
      rol: rol        // rol del usuario en nuestra BD
    };

    // Asegurarse que JWT_SECRET exista antes de firmar (aunque ya lo verificamos arriba)
    if (!JWT_SECRET) {
        console.error('Error Crítico Interno: JWT_SECRET no disponible al momento de firmar el token.');
        // loggingMiddleware registrará esta solicitud con código 500
        return res.status(500).json({ mensaje: 'Error interno del servidor al procesar la autenticación.' });
    }
    
    const tokenJWT = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // 6. Encriptación Adicional del Token JWT (según tus requisitos)
    let tokenParaEnviar;
    try {
      tokenParaEnviar = encryptText(tokenJWT);
    } catch (encError) {
      console.error("Error al encriptar el token JWT:", encError);
      // loggingMiddleware registrará esta solicitud con código 500
      return res.status(500).json({ mensaje: 'Error interno al procesar la seguridad del token.' });
    }
    

    // 7. Respuesta Exitosa
    // loggingMiddleware registrará esta solicitud con código 200
    return res.status(200).json({
      mensaje: 'Autenticación exitosa.',
      token: tokenParaEnviar, // Enviamos el token encriptado
      usuario: { // Enviamos información no sensible del usuario
        id: id,
        nombre: nombre,
        rol: rol
      }
    });

  } catch (error) {
    // Bloque catch para cualquier error inesperado durante el proceso
    console.error("Error inesperado en el proceso de login:", error);
    // loggingMiddleware registrará esta solicitud con código 500
    return res.status(500).json({ mensaje: 'Error interno del servidor. Por favor, intente más tarde.' });
  }
};