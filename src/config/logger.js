// src/config/logger.js
const winston = require('winston');
require('winston-daily-rotate-file'); // Es importante hacer require para que el transporte se registre
const path = require('path');
const fs = require('fs');

// Directorio para los archivos de log (en la raíz del proyecto, creará 'logs')
const logDir = path.join(__dirname, '../../logs');

// Crear la carpeta de logs si no existe
if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir, { recursive: true });
  } catch (error) {
    console.error("Error al crear el directorio de logs:", error);
    // Podrías decidir qué hacer si no se puede crear, por ahora solo loguea.
  }
}

// Definir el nivel de log. Puedes usar una variable de entorno o un default.
const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'info');

// Formato para la consola (con colores)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.align(),
  winston.format.printf(info => {
    const { timestamp, level, message, ...meta } = info;
    let logMessage = `${timestamp} ${level}: ${message}`;
    if (meta && Object.keys(meta).length && !(meta.error && Object.keys(meta).length === 1 && meta.error === undefined)) { // Evitar loguear { error: undefined }
      // No mostrar metadata vacía o solo con 'error: undefined'
      const filteredMeta = Object.entries(meta).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = value;
        return acc;
      }, {});
      if (Object.keys(filteredMeta).length) {
        logMessage += ` ${JSON.stringify(filteredMeta)}`;
      }
    }
    return logMessage;
  })
);

// Formato para los archivos de texto plano (más legible)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }), // Incluye stack trace para errores
  winston.format.splat(), // Necesario para interpolación de strings tipo logger.info('mensaje %s', variable)
  winston.format.printf(info => {
    const { timestamp, level, message, stack, ...meta } = info; // Extraemos stack si existe
    let logMessage = `${timestamp} [${level.toUpperCase()}] ${message}`;
    
    // Añadir metadata relevante que no sea ya parte del mensaje o nivel
    const additionalMeta = {};
    for (const key in meta) {
      if (Object.prototype.hasOwnProperty.call(meta, key) && meta[key] !== undefined) {
        additionalMeta[key] = meta[key];
      }
    }
    if (Object.keys(additionalMeta).length > 0) {
      logMessage += ` - Metadata: ${JSON.stringify(additionalMeta)}`;
    }
    if (stack) { // Si hay un stack de error, lo añadimos
      logMessage += `\nStack: ${stack}`;
    }
    return logMessage;
  })
);

const logger = winston.createLogger({
  level: logLevel,
  defaultMeta: { service: 'api-etl' }, // Metadata por defecto para todos los logs
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
      handleExceptions: true, // Loguear excepciones no capturadas
      handleRejections: true, // Loguear promesas rechazadas no capturadas
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'app-%DATE%.log'), // Log general de la aplicación
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info', // Guarda desde info hacia arriba
      format: fileFormat, // Usamos el formato de texto plano legible
      handleExceptions: true,
      handleRejections: true,
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'), // Log específico para errores
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error', // Solo logs de nivel 'error'
      format: fileFormat, // Usamos el formato de texto plano legible
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
  exitOnError: false, // No salir si Winston falla al loguear
});

module.exports = logger;