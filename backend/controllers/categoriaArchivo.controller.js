const pool = require('../db');

// Obtener todas las categorías
exports.getCategorias = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categoria_archivo ORDER BY id_categoria_archivo'
    );
    
    console.log(`Categorías obtenidas: ${result.rows.length}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

// Obtener categoría por ID
exports.getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM categoria_archivo WHERE id_categoria_archivo = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    console.log(`Categoría encontrada: ${result.rows[0].nombre}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ error: 'Error al obtener categoría' });
  }
};

// Crear nueva categoría
exports.createCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;

    // Validación básica
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
    }

    // Formatear nombre (primera letra mayúscula)
    const nombreFormateado = nombre.trim()
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase());

    // Verificar si ya existe
    const exists = await pool.query(
      'SELECT * FROM categoria_archivo WHERE LOWER(nombre) = LOWER($1)',
      [nombreFormateado]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'Esta categoría ya existe' });
    }

    // Crear categoría
    const result = await pool.query(
      'INSERT INTO categoria_archivo (nombre) VALUES ($1) RETURNING *',
      [nombreFormateado]
    );

    const newCategoria = result.rows[0];
    console.log(`Categoría creada: ${newCategoria.nombre}`);
    
    res.status(201).json({
      message: 'Categoría creada exitosamente',
      categoria: newCategoria
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
};

// Actualizar categoría
exports.updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    // Validación básica
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
    }

    // Verificar si existe la categoría
    const exists = await pool.query(
      'SELECT * FROM categoria_archivo WHERE id_categoria_archivo = $1',
      [id]
    );

    if (exists.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    // Formatear nombre
    const nombreFormateado = nombre.trim()
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase());

    // Verificar si el nuevo nombre ya existe (excluyendo el actual)
    const nameExists = await pool.query(
      'SELECT * FROM categoria_archivo WHERE LOWER(nombre) = LOWER($1) AND id_categoria_archivo != $2',
      [nombreFormateado, id]
    );

    if (nameExists.rows.length > 0) {
      return res.status(400).json({ error: 'Esta categoría ya está en uso' });
    }

    // Actualizar categoría
    const result = await pool.query(
      'UPDATE categoria_archivo SET nombre = $1 WHERE id_categoria_archivo = $2 RETURNING *',
      [nombreFormateado, id]
    );

    const updatedCategoria = result.rows[0];
    console.log(`Categoría actualizada: ${updatedCategoria.nombre}`);
    
    res.json({
      message: 'Categoría actualizada exitosamente',
      categoria: updatedCategoria
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
};

// Eliminar categoría
exports.deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si existe
    const exists = await pool.query(
      'SELECT * FROM categoria_archivo WHERE id_categoria_archivo = $1',
      [id]
    );

    if (exists.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    // Verificar si está siendo usada en archivos
    const inUse = await pool.query(
      'SELECT COUNT(*) as count FROM archivos WHERE id_categoria_archivo = $1',
      [id]
    );

    if (parseInt(inUse.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar. Esta categoría está siendo usada en archivos existentes' 
      });
    }

    // Eliminar categoría
    const deleted = await pool.query(
      'DELETE FROM categoria_archivo WHERE id_categoria_archivo = $1 RETURNING *',
      [id]
    );

    console.log(`Categoría eliminada: ${deleted.rows[0].nombre}`);
    
    res.json({
      message: 'Categoría eliminada exitosamente',
      categoria: deleted.rows[0]
    });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
};