const pool = require('../db');

// Obtener todos los géneros
exports.getGeneros = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM genero_usuario ORDER BY id_genero_usuario'
    );
    
    console.log(`Géneros obtenidos: ${result.rows.length}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener géneros:', error);
    res.status(500).json({ error: 'Error al obtener géneros' });
  }
};

// Obtener género por ID
exports.getGeneroById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM genero_usuario WHERE id_genero_usuario = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Género no encontrado' });
    }

    console.log(`Género encontrado: ${result.rows[0].nombre}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener género:', error);
    res.status(500).json({ error: 'Error al obtener género' });
  }
};

// Crear nuevo género
exports.createGenero = async (req, res) => {
  try {
    const { nombre } = req.body;

    // Validación básica
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre del género es requerido' });
    }

    // Formatear nombre (primera letra mayúscula)
    const nombreFormateado = nombre.trim()
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase());

    // Verificar si ya existe
    const exists = await pool.query(
      'SELECT * FROM genero_usuario WHERE LOWER(nombre) = LOWER($1)',
      [nombreFormateado]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'Este género ya existe' });
    }

    // Crear género
    const result = await pool.query(
      'INSERT INTO genero_usuario (nombre) VALUES ($1) RETURNING *',
      [nombreFormateado]
    );

    const newGenero = result.rows[0];
    console.log(`Género creado: ${newGenero.nombre}`);
    
    res.status(201).json({
      message: 'Género creado exitosamente',
      genero: newGenero
    });
  } catch (error) {
    console.error('Error al crear género:', error);
    res.status(500).json({ error: 'Error al crear género' });
  }
};

// Actualizar género
exports.updateGenero = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    // Validación básica
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre del género es requerido' });
    }

    // Verificar si existe el género
    const exists = await pool.query(
      'SELECT * FROM genero_usuario WHERE id_genero_usuario = $1',
      [id]
    );

    if (exists.rows.length === 0) {
      return res.status(404).json({ error: 'Género no encontrado' });
    }

    // Formatear nombre
    const nombreFormateado = nombre.trim()
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase());

    // Verificar si el nuevo nombre ya existe (excluyendo el actual)
    const nameExists = await pool.query(
      'SELECT * FROM genero_usuario WHERE LOWER(nombre) = LOWER($1) AND id_genero_usuario != $2',
      [nombreFormateado, id]
    );

    if (nameExists.rows.length > 0) {
      return res.status(400).json({ error: 'Este género ya está en uso' });
    }

    // Actualizar género
    const result = await pool.query(
      'UPDATE genero_usuario SET nombre = $1 WHERE id_genero_usuario = $2 RETURNING *',
      [nombreFormateado, id]
    );

    const updatedGenero = result.rows[0];
    console.log(`Género actualizado: ${updatedGenero.nombre}`);
    
    res.json({
      message: 'Género actualizado exitosamente',
      genero: updatedGenero
    });
  } catch (error) {
    console.error('Error al actualizar género:', error);
    res.status(500).json({ error: 'Error al actualizar género' });
  }
};

// Eliminar género
exports.deleteGenero = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si existe
    const exists = await pool.query(
      'SELECT * FROM genero_usuario WHERE id_genero_usuario = $1',
      [id]
    );

    if (exists.rows.length === 0) {
      return res.status(404).json({ error: 'Género no encontrado' });
    }

    // Verificar si está siendo usado en usuarios
    const inUse = await pool.query(
      'SELECT COUNT(*) as count FROM usuarios WHERE id_genero_usuario = $1',
      [id]
    );

    if (parseInt(inUse.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar. Este género está siendo usado por usuarios existentes' 
      });
    }

    // Eliminar género
    const deleted = await pool.query(
      'DELETE FROM genero_usuario WHERE id_genero_usuario = $1 RETURNING *',
      [id]
    );

    console.log(`Género eliminado: ${deleted.rows[0].nombre}`);
    
    res.json({
      message: 'Género eliminado exitosamente',
      genero: deleted.rows[0]
    });
  } catch (error) {
    console.error('Error al eliminar género:', error);
    res.status(500).json({ error: 'Error al eliminar género' });
  }
};