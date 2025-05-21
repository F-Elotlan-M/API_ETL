// src/controllers/etlController.js
const { ETL } = require('../models'); // Solo necesitamos el modelo ETL aquí

exports.listarETLs = async (req, res) => {
  try {
    const etls = await ETL.findAll({
      attributes: ['id', 'nombre', 'descripcion', 'tipo'] // Campos a devolver
    });
    return res.status(200).json(etls);
  } catch (error) {
    console.error("Error al listar ETLs:", error);
    return res.status(500).json({ mensaje: 'Error interno del servidor al listar ETLs.' });
  }
};