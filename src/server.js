// mi_api_etl/src/server.js

// mi_api_etl/src/server.js

require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models');

const swaggerUi = require('swagger-ui-express');
const fs = require('node:fs'); // Módulo fs de Node para leer archivos
const path = require('node:path'); // Módulo path de Node para construir rutas de archivo
const yaml = require('js-yaml'); // Para parsear el archivo YAML

const loggingMiddleware = require('./middleware/loggingMiddleware');
const usuarioRoutes = require('./routes/usuarioRoutes'); // <--- AÑADE ESTA LÍNEA
const etlRoutes = require('./routes/etlRoutes'); // <--- AÑADE ESTA LÍNEA
const reporteRoutes = require('./routes/reporteRoutes');

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

app.get('/', (req, res) => {
  res.send('¡API de ETLs funcionando correctamente!');
});

// Manejador de errores global (opcional pero recomendado)
app.use((err, req, res, next) => {
  console.error("Error no manejado:", err.stack);
  res.status(500).send('¡Algo salió muy mal en el servidor!');
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