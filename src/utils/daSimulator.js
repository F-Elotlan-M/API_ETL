// src/utils/daSimulator.js

// Lista simulada de usuarios que "existen" en el Directorio Activo
// En un futuro, aquí iría la lógica real de consulta al DA.
const usuariosValidosEnDA = [
  'admin_user',           // Un administrador que también estará en nuestra BD local
  'consultor_user',   // Un consultor que estará en BD local y tendrá permisos ETL
  'consultor_dos',   // Un consultor que estará en BD local PERO SIN permisos ETL
  'UsuarioPruebaLog2'  // Un usuario que existe en DA pero NO estará en nuestra BD local
];

/**
 * Simula la verificación de un usuario en el Directorio Activo.
 * @param {string} username - El nombre de usuario a verificar.
 * @returns {Promise<boolean>} - True si el usuario existe en el DA simulado, false en caso contrario.
 */
const checkUserInDA = async (username) => {
  // Simulamos una operación asíncrona
  await new Promise(resolve => setTimeout(resolve, 50)); // Pequeña demora simulada

  // Convertimos a minúsculas para una comparación insensible a mayúsculas/minúsculas,
  // similar a como funcionan algunos DAs. Ajusta si tu DA real es sensible.
  const usernameLower = username.toLowerCase();
  const usuariosDALower = usuariosValidosEnDA.map(u => u.toLowerCase());

  return usuariosDALower.includes(usernameLower);
};

module.exports = {
  checkUserInDA,
  // Exporta la lista si necesitas acceder a ella para pruebas desde otros módulos
  // usuariosValidosEnDA 
};