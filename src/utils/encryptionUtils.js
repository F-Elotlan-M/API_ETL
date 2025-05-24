// src/utils/encryptionUtils.js
const crypto = require('node:crypto');

// Estas son las cadenas base que usaste en tu ejemplo de CryptoJS
const BASE_KEY_STRING = process.env.TOKEN_ENCRYPTION_KEY || '960d2c71052';
const BASE_IV_STRING = process.env.TOKEN_ENCRYPTION_IV || '354712Zxvagjalwq';

// 1. Derivación de la Clave (Key) - 16 bytes para AES-128
// SHA256 -> HexString (64 chars) -> Tomar primeros 32 chars (16 bytes)
const derivedKeyHex = crypto.createHash('sha256').update(BASE_KEY_STRING).digest('hex').substring(0, 32);
const KEY = Buffer.from(derivedKeyHex, 'hex'); // 16 bytes

// 2. Derivación del IV (Vector de Inicialización) - 16 bytes para AES-CBC
// Tu original tomaba 16 chars hex (8 bytes). Para AES-CBC, se necesitan 16 bytes.
// Usaremos el mismo método que para la clave para obtener 16 bytes.
const derivedIvHex = crypto.createHash('sha256').update(BASE_IV_STRING).digest('hex').substring(0, 32);
const IV = Buffer.from(derivedIvHex, 'hex'); // 16 bytes

const ALGORITHM = 'aes-128-cbc'; // Coincide con clave de 16 bytes y IV de 16 bytes

/**
 * Encripta texto replicando el proceso de doble Base64 (con IV corregido a 16 bytes).
 * @param {string} texto - El texto a encriptar (ej. el token JWT).
 * @returns {string} - El texto encriptado con el proceso similar al de referencia.
 */
function encryptTextSimilarToReference(texto) {
  if (texto === null || texto === undefined) {
    texto = "Vacio"; // Comportamiento de tu función de referencia
  }

  try {
    // Paso A: Encriptar con AES-128-CBC y obtener el resultado como Base64
    // (esto es lo que `encrypted.toString()` de CryptoJS AES suele hacer)
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, IV);
    let encryptedBase64 = cipher.update(texto, 'utf8', 'base64');
    encryptedBase64 += cipher.final('base64');

    // Paso B: Replicar el "doble Base64"
    // CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encrypted.toString()));
    // Esto significa: tomar la cadena Base64 (encryptedBase64), tratar sus bytes como si fueran una cadena UTF-8,
    // y luego codificar esos bytes (de la interpretación UTF-8) de nuevo en Base64.
    const dobleBase64 = Buffer.from(encryptedBase64, 'utf8').toString('base64');
    
    return dobleBase64;

  } catch (error) {
    console.error("Error en encryptTextSimilarToReference:", error);
    // En un caso real, podrías querer loguear el error de forma más robusta
    // y quizás no lanzar el error crudo si esto puede exponer detalles sensibles.
    // Pero para desarrollo, lanzarlo ayuda a depurar.
    throw error; 
  }
}

/**
 * Desencripta texto que fue encriptado con encryptTextSimilarToReference.
 * Este es el proceso inverso.
 * @param {string} encryptedDobleBase64 - El texto encriptado con doble Base64.
 * @returns {string|null} - El texto original desencriptado, o null si era "Vacio".
 */
function decryptTextSimilarToReference(encryptedDobleBase64) {
  try {
    // Paso B Inverso: Decodificar el segundo Base64 para obtener la cadena Base64 original (interpretada como UTF-8)
    const originalEncryptedBase64 = Buffer.from(encryptedDobleBase64, 'base64').toString('utf8');

    // Paso A Inverso: Desencriptar la cadena Base64 original
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, IV);
    let decrypted = decipher.update(originalEncryptedBase64, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    if (decrypted === "Vacio") {
      return null;
    }
    return decrypted;

  } catch (error) {
    console.error("Error en decryptTextSimilarToReference:", error);
    // Puede fallar si el token está corrupto, la clave/IV son incorrectos, o el padding es inválido.
    // En un login, un fallo aquí significaría que el token no es válido.
    return null; // O lanzar un error específico
  }
}

module.exports = {
  encryptText: encryptTextSimilarToReference, // Renombramos para que la llames igual
  decryptText: decryptTextSimilarToReference  // Para consistencia
};