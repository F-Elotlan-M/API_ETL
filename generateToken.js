// mi_api_etl/generateToken.js
require('dotenv').config(); // Para cargar JWT_SECRET desde .env
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("Error: JWT_SECRET no está definido en tu archivo .env");
  process.exit(1);
}

// Define el payload para tu usuario Administrador de prueba
// Puedes usar un ID de usuario existente que sepas que es admin,
// o un ID ficticio solo para generar el token.
// El middleware 'isAdmin' solo chequeará la propiedad 'rol'.
const adminPayload = {
  id: 1, // ID de ejemplo para un administrador
  nombre: 'Administrador Principal', // Nombre de ejemplo
  rol: 'Administrador' // ¡ESTO ES LO IMPORTANTE!
};

// Opciones del token (opcional, por ejemplo, cuánto tiempo será válido)
const opciones = {
  expiresIn: '1h' // El token expirará en 1 hora (puedes poner '7d', '30m', etc.)
};

// Generar el token
const token = jwt.sign(adminPayload, JWT_SECRET, opciones);

console.log('--- Token JWT Generado para Administrador (válido por 1 hora) ---');
console.log(token);
console.log('-----------------------------------------------------------------');
console.log('Recuerda usar este token en el header "Authorization: Bearer <token>"');