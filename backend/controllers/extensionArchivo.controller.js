const pool = require('../db');

// Obtener todas las extensiones
exports.getExtensiones = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM extension_archivo ORDER BY id_extension_archivo'
    );
    
    console.log(`Extensiones obtenidas: ${result.rows.length}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener extensiones:', error);
    res.status(500).json({ error: 'Error al obtener extensiones' });
  }
};

// Obtener extensión por ID
exports.getExtensionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM extension_archivo WHERE id_extension_archivo = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Extensión no encontrada' });
    }

    console.log(`Extensión encontrada: ${result.rows[0].nombre}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener extensión:', error);
    res.status(500).json({ error: 'Error al obtener extensión' });
  }
};

// Crear nueva extensión
exports.createExtension = async (req, res) => {
  try {
    const { nombre } = req.body;

    // Validación básica
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre de la extensión es requerido' });
    }

    // Limpiar y formatear extensión (agregar punto si no lo tiene)
    let extensionFormateada = nombre.trim().toLowerCase();
    if (!extensionFormateada.startsWith('.')) {
      extensionFormateada = '.' + extensionFormateada;
    }

    // Verificar si ya existe
    const exists = await pool.query(
      'SELECT * FROM extension_archivo WHERE LOWER(nombre) = LOWER($1)',
      [extensionFormateada]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'Esta extensión ya existe' });
    }

    // Crear extensión
    const result = await pool.query(
      'INSERT INTO extension_archivo (nombre) VALUES ($1) RETURNING *',
      [extensionFormateada]
    );

    const newExtension = result.rows[0];
    console.log(`Extensión creada: ${newExtension.nombre}`);
    
    res.status(201).json({
      message: 'Extensión creada exitosamente',
      extension: newExtension
    });
  } catch (error) {
    console.error('Error al crear extensión:', error);
    res.status(500).json({ error: 'Error al crear extensión' });
  }
};

// Actualizar extensión
exports.updateExtension = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    // Validación básica
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre de la extensión es requerido' });
    }

    // Verificar si existe la extensión
    const exists = await pool.query(
      'SELECT * FROM extension_archivo WHERE id_extension_archivo = $1',
      [id]
    );

    if (exists.rows.length === 0) {
      return res.status(404).json({ error: 'Extensión no encontrada' });
    }

    // Limpiar y formatear extensión
    let extensionFormateada = nombre.trim().toLowerCase();
    if (!extensionFormateada.startsWith('.')) {
      extensionFormateada = '.' + extensionFormateada;
    }

    // Verificar si el nuevo nombre ya existe (excluyendo el actual)
    const nameExists = await pool.query(
      'SELECT * FROM extension_archivo WHERE LOWER(nombre) = LOWER($1) AND id_extension_archivo != $2',
      [extensionFormateada, id]
    );

    if (nameExists.rows.length > 0) {
      return res.status(400).json({ error: 'Esta extensión ya está en uso' });
    }

    // Actualizar extensión
    const result = await pool.query(
      'UPDATE extension_archivo SET nombre = $1 WHERE id_extension_archivo = $2 RETURNING *',
      [extensionFormateada, id]
    );

    const updatedExtension = result.rows[0];
    console.log(`Extensión actualizada: ${updatedExtension.nombre}`);
    
    res.json({
      message: 'Extensión actualizada exitosamente',
      extension: updatedExtension
    });
  } catch (error) {
    console.error('Error al actualizar extensión:', error);
    res.status(500).json({ error: 'Error al actualizar extensión' });
  }
};

// Eliminar extensión
exports.deleteExtension = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si existe
    const exists = await pool.query(
      'SELECT * FROM extension_archivo WHERE id_extension_archivo = $1',
      [id]
    );

    if (exists.rows.length === 0) {
      return res.status(404).json({ error: 'Extensión no encontrada' });
    }

    // Verificar si está siendo usado en archivos
    const inUse = await pool.query(
      'SELECT COUNT(*) as count FROM archivos WHERE id_extension_archivo = $1',
      [id]
    );

    if (parseInt(inUse.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar. Esta extensión está siendo usada en archivos existentes' 
      });
    }

    // Eliminar extensión
    const deleted = await pool.query(
      'DELETE FROM extension_archivo WHERE id_extension_archivo = $1 RETURNING *',
      [id]
    );

    console.log(`Extensión eliminada: ${deleted.rows[0].nombre}`);
    
    res.json({
      message: 'Extensión eliminada exitosamente',
      extension: deleted.rows[0]
    });
  } catch (error) {
    console.error('Error al eliminar extensión:', error);
    res.status(500).json({ error: 'Error al eliminar extensión' });
  }
};