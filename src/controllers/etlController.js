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

exports.crearETL = async (req, res) => {
  const { nombre, tipo, descripcion } = req.body;

  // 1. Validación de entrada básica
  if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
    return res.status(400).json({ mensaje: 'El campo "nombre" es requerido y debe ser una cadena de texto no vacía.' });
  }

  // El tipo y la descripción pueden ser opcionales o tener sus propias validaciones
  // Por ahora, si se proveen, deben ser strings.
  if (tipo && typeof tipo !== 'string') {
    return res.status(400).json({ mensaje: 'Si se proporciona, el campo "tipo" debe ser una cadena de texto.' });
  }
  if (descripcion && typeof descripcion !== 'string') {
    return res.status(400).json({ mensaje: 'Si se proporciona, el campo "descripcion" debe ser una cadena de texto.' });
  }

  try {
    // Opcional: Verificar si ya existe un ETL con el mismo nombre para evitar duplicados.
    // Si el nombre debe ser único, deberías tener una restricción UNIQUE en la BD
    // y/o manejar el error SequelizeUniqueConstraintError aquí.
    // const etlExistente = await ETL.findOne({ where: { nombre: nombre.trim() } });
    // if (etlExistente) {
    //   return res.status(409).json({ mensaje: `Ya existe un ETL con el nombre '${nombre.trim()}'.` });
    // }

    // 2. Crear el nuevo ETL en la base de datos
    const nuevoETL = await ETL.create({
      nombre: nombre.trim(),
      tipo: tipo ? tipo.trim() : null, // Guardar null si no se provee o es vacío
      descripcion: descripcion ? descripcion.trim() : null // Guardar null si no se provee o es vacío
    });

    // 3. Responder con el ETL creado
    return res.status(201).json({
      id: nuevoETL.id,
      nombre: nuevoETL.nombre,
      tipo: nuevoETL.tipo,
      descripcion: nuevoETL.descripcion,
      createdAt: nuevoETL.createdAt,
      updatedAt: nuevoETL.updatedAt,
      mensaje: 'ETL creado exitosamente.'
    });

  } catch (error) {
    // Si tuvieras una restricción UNIQUE en el nombre a nivel de BD,
    // podrías capturar SequelizeUniqueConstraintError aquí.
    // if (error.name === 'SequelizeUniqueConstraintError') {
    //   return res.status(409).json({ mensaje: `Error al crear ETL: ${error.errors[0].message}` });
    // }
    console.error("Error al crear ETL:", error);
    return res.status(500).json({ mensaje: 'Error interno del servidor al intentar crear el ETL.' });
  }
};