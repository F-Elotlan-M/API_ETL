// mi_api_etl/src/server.js

// mi_api_etl/src/server.js

require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models');

// Importar las rutas
const usuarioRoutes = require('./routes/usuarioRoutes'); // <--- AÑADE ESTA LÍNEA
const etlRoutes = require('./routes/etlRoutes'); // <--- AÑADE ESTA LÍNEA

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Montar las rutas de la API
app.use('/api/usuarios', usuarioRoutes); // <--- AÑADE ESTA LÍNEA: Todas las rutas en usuarioRoutes estarán prefijadas con /api/usuarios
app.use('/api/etls', etlRoutes);

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