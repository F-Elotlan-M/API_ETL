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

exports.obtenerETLPorId = async (req, res) => {
  const { idEtl } = req.params;

  try {
    const etl = await ETL.findByPk(idEtl, {
      attributes: ['id', 'nombre', 'tipo', 'descripcion', 'createdAt', 'updatedAt']
    });

    if (!etl) {
      return res.status(404).json({ mensaje: `ETL con ID ${idEtl} no encontrado.` });
    }

    return res.status(200).json(etl);

  } catch (error) {
    console.error(`Error al obtener ETL con ID ${idEtl}:`, error);
    return res.status(500).json({ mensaje: 'Error interno del servidor al obtener el ETL.' });
  }
};

exports.actualizarETL = async (req, res) => {
  const { idEtl } = req.params;
  const { nombre, tipo, descripcion } = req.body;

  // Validación de entrada: al menos un campo debe estar presente para actualizar
  // aunque la lógica de Sequelize manejará si no hay cambios.
  // Los campos individuales se validarán si se proporcionan.
  if (nombre === undefined && tipo === undefined && descripcion === undefined) {
    return res.status(400).json({ mensaje: 'Se requiere al menos un campo (nombre, tipo o descripcion) para actualizar.' });
  }

  const camposParaActualizar = {};
  let nombreTrimmed;

  if (nombre !== undefined) {
    if (typeof nombre !== 'string' || nombre.trim() === '') {
      return res.status(400).json({ mensaje: 'Si se proporciona, el campo "nombre" no puede ser vacío.' });
    }
    nombreTrimmed = nombre.trim();
    camposParaActualizar.nombre = nombreTrimmed;
  }

  if (tipo !== undefined) {
    // Si tipo es una cadena vacía, se considera una intención de borrarlo (setear a null)
    // Si es null, también se setea a null.
    // Si es una cadena no vacía, se trimea.
    camposParaActualizar.tipo = (typeof tipo === 'string' && tipo.trim() !== '') ? tipo.trim() : null;
  }

  if (descripcion !== undefined) {
    camposParaActualizar.descripcion = (typeof descripcion === 'string' && descripcion.trim() !== '') ? descripcion.trim() : null;
  }


  try {
    const etl = await ETL.findByPk(idEtl);

    if (!etl) {
      return res.status(404).json({ mensaje: `ETL con ID ${idEtl} no encontrado.` });
    }

    // Opcional: Verificar unicidad del nombre si se está cambiando y se requiere que sea único
    // Esta verificación es contra OTROS ETLs.
    if (nombreTrimmed && nombreTrimmed !== etl.nombre) {
      const etlExistenteConEseNombre = await ETL.findOne({
        where: {
          nombre: nombreTrimmed,
          id: { [Op.ne]: idEtl } // Excluir el ETL actual de la búsqueda por nombre
        }
      });
      if (etlExistenteConEseNombre) {
        return res.status(409).json({ mensaje: `Ya existe otro ETL con el nombre '${nombreTrimmed}'.` });
      }
    }

    // Actualizar el ETL con los campos proporcionados
    await etl.update(camposParaActualizar);

    return res.status(200).json({
      id: etl.id,
      nombre: etl.nombre,
      tipo: etl.tipo,
      descripcion: etl.descripcion,
      createdAt: etl.createdAt,
      updatedAt: etl.updatedAt, // Sequelize actualiza updatedAt automáticamente
      mensaje: 'ETL actualizado exitosamente.'
    });

  } catch (error) {
    // if (error.name === 'SequelizeUniqueConstraintError') { // Si tuvieras unique a nivel BD y fallara
    //   return res.status(409).json({ mensaje: `Error al actualizar ETL: ${error.errors[0].message}` });
    // }
    console.error(`Error al actualizar ETL con ID ${idEtl}:`, error);
    return res.status(500).json({ mensaje: 'Error interno del servidor al actualizar el ETL.' });
  }
};

