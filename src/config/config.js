// src/config/config.js
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '..', '.env') });

const selectedDialect = process.env.DB_DIALECT_SELECT || 'postgres'; // Default a postgres si no está definido

let dbConfig = {};

if (selectedDialect === 'postgres') {
  dbConfig = {
    username: process.env.DB_USER_PG,
    password: process.env.DB_PASS_PG,
    database: process.env.DB_NAME_PG,
    host: process.env.DB_HOST_PG,
    port: parseInt(process.env.DB_PORT_PG || '5432'),
    dialect: 'postgres',
    // dialectOptions para postgres si las necesitas
  };
} else if (selectedDialect === 'mssql') {
  dbConfig = {
    username: process.env.DB_USER_SQLSERVER,
    password: process.env.DB_PASS_SQLSERVER,
    database: process.env.DB_NAME_SQLSERVER,
    host: process.env.DB_HOST_SQLSERVER,
    port: parseInt(process.env.DB_PORT_SQLSERVER || '1433'),
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: process.env.DB_ENCRYPT_SQLSERVER === 'true',
        trustServerCertificate: process.env.DB_TRUST_CERT_SQLSERVER === 'true',
        instanceName: process.env.DB_INSTANCE_NAME_SQLSERVER,
      }
    }
  };
} else {
  throw new Error(`Dialecto de base de datos no soportado o no especificado: ${selectedDialect}`);
}

// Exportar la configuración para todos los entornos (development, test, production)
// usando la configuración del dialecto seleccionado.
module.exports = {
  development: dbConfig,
  test: { ...dbConfig, database: process.env[`DB_NAME_${selectedDialect.toUpperCase()}_TEST`] || `${dbConfig.database}_test` }, // Ajusta para test
  production: { ...dbConfig /* Aquí deberías usar variables de entorno específicas de producción */ }
};