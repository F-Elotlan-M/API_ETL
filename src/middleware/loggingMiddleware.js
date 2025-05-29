// src/middleware/loggingMiddleware.js
const { Log } = require('../models');         // Tu modelo Sequelize para la BD
const logger = require('../config/logger'); // Nuestro nuevo logger Winston

const loggingMiddleware = async (req, res, next) => {
  // Excluimos las rutas de Swagger UI del logging
  if (req.originalUrl.startsWith('/api-docs')) {
    return next();
  }

  const startTime = process.hrtime();
  const fechaInicio = new Date();
  const { method, originalUrl, ip, headers, query } = req; // Capturamos datos de la solicitud

  // Lógica para capturar el cuerpo de la respuesta
  const originalSend = res.send;
  let responseBodyString; // Para almacenar el cuerpo de la respuesta como string

  res.send = function (body) {
    if (body) {
      if (Buffer.isBuffer(body)) {
        responseBodyString = `[Buffer data, length: ${body.length}]`;
      } else if (typeof body === 'object') {
        try {
          responseBodyString = JSON.stringify(body);
        } catch (e) {
          responseBodyString = "[Object no serializable]";
        }
      } else {
        responseBodyString = String(body);
      }
    }
    originalSend.apply(res, arguments); // Llamamos al método original para enviar la respuesta
  };

  // Cuando la respuesta haya terminado de enviarse
  res.on('finish', async () => {
    const fechaFin = new Date();
    const diff = process.hrtime(startTime);
    const tiempoResMs = Math.round((diff[0] * 1e9 + diff[1]) / 1e6);
    const { statusCode } = res;
    const usuarioInfo = req.user ? (req.user.nombre || String(req.user.id)) : 'Anónimo/Sistema';

    // Truncado de Petición y Respuesta
    const MAX_LENGTH = 5000; // Límite de caracteres para logs (ajusta según necesidad)
    let peticionLog = req.body && Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : null;
    if (peticionLog && peticionLog.length > MAX_LENGTH) {
      peticionLog = peticionLog.substring(0, MAX_LENGTH) + '... [TRUNCATED]';
    }

    let respuestaLog = responseBodyString;
    if (respuestaLog && respuestaLog.length > MAX_LENGTH) {
      respuestaLog = respuestaLog.substring(0, MAX_LENGTH) + '... [TRUNCATED]';
    }

    // Datos para el log de Winston (más detallado para el archivo de texto)
    const winstonLogData = {
      method: method,
      url: originalUrl,
      status: statusCode,
      responseTimeMs: tiempoResMs,
      ip: ip,
      usuario: usuarioInfo,
      requestQuery: Object.keys(query).length > 0 ? query : undefined, // Solo si hay query params
      requestBody: peticionLog,   // Cuerpo de la solicitud (puede ser null)
      responseBody: respuestaLog, // Cuerpo de la respuesta (puede ser undefined)
      // userAgent: headers['user-agent'] // Ejemplo de otro header útil
    };

    // Loguear a Winston (esto irá a consola y archivo)
    // Usamos un mensaje simple y pasamos el resto como metadata.
    // El formato printf en logger.js se encargará de cómo se muestra.
    if (statusCode >= 400) {
      logger.warn(`HTTP Request: ${method} ${originalUrl}`, winstonLogData); // O logger.error si >= 500
    } else {
      logger.info(`HTTP Request: ${method} ${originalUrl}`, winstonLogData);
    }

    // Datos para el log de Base de Datos (como lo tenías)
    const dbLogData = {
      Servicio: `${method} ${originalUrl}`,
      Fecha_Inicio: fechaInicio,
      Fecha_Fin: fechaFin,
      Tiempo_Res: tiempoResMs,
      Peticion: peticionLog,
      Respuesta: respuestaLog,
      Ip: ip,
      Usuario: usuarioInfo === 'Anónimo/Sistema' ? null : usuarioInfo,
      Codigo_Res: statusCode
    };

    try {
      await Log.create(dbLogData);
    } catch (dbError) {
      // Loguear el error de BD usando Winston
      logger.error('Error al guardar log detallado en BD:', { 
        message: dbError.message, 
        originalError: dbError 
      });
    }
  });

  next(); // Continuar con el siguiente middleware o la ruta
};

module.exports = loggingMiddleware;