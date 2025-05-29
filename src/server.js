require('dotenv').config();
const express = require('express');
const logger = require('./config/logger');
const { sequelize } = require('./models');

const swaggerUi = require('swagger-ui-express');
const fs = require('node:fs'); // Módulo fs de Node para leer archivos
const path = require('node:path'); // Módulo path de Node para construir rutas de archivo
const yaml = require('js-yaml'); // Para parsear el archivo YAML

const loggingMiddleware = require('./middleware/loggingMiddleware');
const usuarioRoutes = require('./routes/usuarioRoutes'); // <--- AÑADE ESTA LÍNEA
const etlRoutes = require('./routes/etlRoutes'); // <--- AÑADE ESTA LÍNEA
const reporteRoutes = require('./routes/reporteRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);

try {
  // Construye la ruta al archivo swagger.yaml (asumiendo que está en la raíz del proyecto)
  const swaggerDocumentPath = path.join(__dirname, '../swagger.yaml'); 
  const swaggerDocumentFile = fs.readFileSync(swaggerDocumentPath, 'utf8');
  const swaggerSpecManual = yaml.load(swaggerDocumentFile);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecManual));
  console.log(`[Swagger] Documentación (manual desde YAML) disponible en http://localhost:${PORT}/api-docs`);
} catch (e) {
  console.error('[Swagger] Error crítico al cargar o parsear swagger.yaml:', e.message);
  const errorSpec = {openapi: '3.0.0', info: {title: 'Error al Cargar Documentación Swagger', version: '0'}, paths: {}};
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(errorSpec));
}
// ----------------------------------------------------------

// Ruta de prueba para /api/health-check (para que coincida con swagger.yaml)
app.get('/api/health-check', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API is healthy and running!',
    timestamp: new Date().toISOString()
  });
});

// Montar las rutas de la API
app.use('/api/usuarios', usuarioRoutes); // <--- AÑADE ESTA LÍNEA: Todas las rutas en usuarioRoutes estarán prefijadas con /api/usuarios
app.use('/api/etls', etlRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('¡API de ETLs funcionando correctamente!');
});

// Manejador de errores global (opcional pero recomendado)
app.use((err, req, res, next) => {
  logger.error(`Error no manejado en la ruta: ${req.method} ${req.originalUrl} - ${err.message || 'Error desconocido'}`, { 
    stack: err.stack, 
    errorObject: err // Loguea el objeto de error completo si es posible
  });
  if (!res.headersSent) {
    res.status(err.status || 500).json({ 
      mensaje: err.message || 'Ocurrió un error inesperado en el servidor.' 
    });
  } else {
    next(err); // Si ya se enviaron headers, delega al manejador de errores por defecto de Express
  }
});


async function startServer() {
  try {
    await sequelize.authenticate();
    console.log(`Conexión a la base de datos PostgreSQL (${process.env.DB_NAME}) establecida correctamente.`);

    app.listen(PORT, () => {
      console.log(`Servidor Express escuchando en el puerto ${PORT}`);
      console.log(`Accede en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo conectar y/o sincronizar con la base de datos:', error);
    process.exit(1);
  }
}

startServer();

process.on('uncaughtException', (error) => {
  logger.error('Excepción GLOBAL no capturada:', { message: error.message, stack: error.stack, errorObject: error });
  // Considera cerrar de forma ordenada y salir en producción
  // process.exit(1); 
});
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Rechazo de Promesa GLOBAL no manejado:', { reason: String(reason), promiseDetails: promise }); // String(reason) para evitar problemas si 'reason' es complejo
  // process.exit(1); 
});