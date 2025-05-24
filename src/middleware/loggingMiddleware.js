// src/middleware/loggingMiddleware.js
const { Log } = require('../models');

const loggingMiddleware = async (req, res, next) => {
  const startTime = process.hrtime(); // Tiempo de inicio de alta precisión
  const fechaInicio = new Date();

  // Capturar el cuerpo de la respuesta
  // Guardamos la función original res.send
  const originalSend = res.send;
  let responseBody; // Variable para almacenar el cuerpo de la respuesta

  // Sobrescribimos res.send para capturar su contenido
  res.send = function (body) {
    // Si el body no es un buffer, lo convertimos a string
    // (esto es una simplificación, en producción puede necesitar más manejo de tipos)
    if (body && !(body instanceof Buffer)) {
      try {
        // Si es un objeto, intentamos convertirlo a JSON string
        responseBody = typeof body === 'object' ? JSON.stringify(body) : String(body);
      } catch (e) {
        responseBody = String(body); // Fallback a string simple
      }
    } else if (body instanceof Buffer) {
      responseBody = `[Buffer data, length: ${body.length}]`; // O intenta decodificar si sabes el encoding
    }
    // Llamamos a la función original res.send con los argumentos originales
    originalSend.apply(res, arguments);
  };


  // Cuando la respuesta haya terminado de enviarse (evento 'finish')
  res.on('finish', async () => {
    const fechaFin = new Date();
    const diff = process.hrtime(startTime); // [segundos, nanosegundos]
    const tiempoResMs = Math.round((diff[0] * 1e9 + diff[1]) / 1e6); // Convertir a milisegundos

    // Limitar la longitud de la petición y respuesta para no saturar la BD
    const MAX_LENGTH = 10000; // Por ejemplo, 10000 caracteres
    let peticionLog = req.body ? JSON.stringify(req.body) : null;
    if (peticionLog && peticionLog.length > MAX_LENGTH) {
      peticionLog = peticionLog.substring(0, MAX_LENGTH) + '... [TRUNCATED]';
    }

    let respuestaLog = responseBody;
    if (respuestaLog && respuestaLog.length > MAX_LENGTH) {
      respuestaLog = respuestaLog.substring(0, MAX_LENGTH) + '... [TRUNCATED]';
    }

    const logData = {
      Servicio: `${req.method} ${req.originalUrl}`,
      Fecha_Inicio: fechaInicio,
      Fecha_Fin: fechaFin,
      Tiempo_Res: tiempoResMs,
      Peticion: peticionLog,
      Respuesta: respuestaLog, // El cuerpo capturado de la respuesta
      Ip: req.ip || req.socket.remoteAddress,
      // Por ahora, el usuario será 'undefined' (se guardará como NULL si la columna lo permite)
      // Cuando tengas login, aquí pondrías req.user.nombre o req.user.id
      Usuario: req.user ? (req.user.nombre || req.user.id) : null, // Intentar obtenerlo si ya existe req.user
      Codigo_Res: res.statusCode
    };

    try {
      await Log.create(logData);
    } catch (dbError) {
      console.error('Error al guardar el log en la base de datos:', dbError);
      // Decide si quieres que un error de logging afecte la respuesta al cliente (probablemente no)
    }
  });

  next(); // Continuar con el siguiente middleware o la ruta
};

module.exports = loggingMiddleware;