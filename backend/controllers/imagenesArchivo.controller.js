const pool = require('../db');

// Obtener todas las imágenes de un archivo específico
exports.getImagenesArchivo = async (req, res) => {
  try {
    const { archivo_id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM imagenes_archivo WHERE id_archivo = $1 ORDER BY orden ASC, id_imagenes_archivo ASC',
      [archivo_id]
    );
    
    console.log(`Imágenes del archivo ${archivo_id}: ${result.rows.length}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener imágenes del archivo:', error);
    res.status(500).json({ error: 'Error al obtener imágenes del archivo' });
  }
};

// Obtener imagen específica por ID
exports.getImagenById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM imagenes_archivo WHERE id_imagenes_archivo = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    console.log(`Imagen encontrada: ${result.rows[0].url_imagen}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener imagen:', error);
    res.status(500).json({ error: 'Error al obtener imagen' });
  }
};

// Crear nueva imagen para un archivo
exports.createImagen = async (req, res) => {
  try {
    const { archivo_id } = req.params;
    const { url_imagen, orden, es_portada } = req.body;

    // Validaciones básicas
    if (!url_imagen || url_imagen.trim() === '') {
      return res.status(400).json({ error: 'La URL de la imagen es requerida' });
    }

    // Verificar que existe el archivo
    const archivoExists = await pool.query(
      'SELECT * FROM archivos WHERE id_archivo = $1',
      [archivo_id]
    );

    if (archivoExists.rows.length === 0) {
      return res.status(400).json({ error: 'Archivo no encontrado' });
    }

    await pool.query('BEGIN');

    try {
      // Si se marca como portada, quitar portada a otras imágenes del mismo archivo
      if (es_portada) {
        await pool.query(
          'UPDATE imagenes_archivo SET es_portada = false WHERE id_archivo = $1',
          [archivo_id]
        );
      }

      // Si no se especifica orden, obtener el siguiente orden disponible
      let ordenFinal = orden;
      if (!ordenFinal) {
        const maxOrden = await pool.query(
          'SELECT COALESCE(MAX(orden), 0) + 1 as siguiente_orden FROM imagenes_archivo WHERE id_archivo = $1',
          [archivo_id]
        );
        ordenFinal = maxOrden.rows[0].siguiente_orden;
      }

      // Crear imagen
      const result = await pool.query(`
        INSERT INTO imagenes_archivo (id_archivo, url_imagen, orden, es_portada) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `, [
        archivo_id,
        url_imagen.trim(),
        ordenFinal,
        es_portada || false
      ]);

      await pool.query('COMMIT');

      const newImagen = result.rows[0];
      console.log(`Imagen creada para archivo ${archivo_id}: ${newImagen.url_imagen}`);
      
      res.status(201).json({
        message: 'Imagen creada exitosamente',
        imagen: newImagen
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error al crear imagen:', error);
    res.status(500).json({ error: 'Error al crear imagen' });
  }
};

// Actualizar imagen
exports.updateImagen = async (req, res) => {
  try {
    const { id } = req.params;
    const { url_imagen, orden, es_portada } = req.body;

    // Verificar que existe la imagen
    const exists = await pool.query(
      'SELECT * FROM imagenes_archivo WHERE id_imagenes_archivo = $1',
      [id]
    );

    if (exists.rows.length === 0) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    const imagenActual = exists.rows[0];

    await pool.query('BEGIN');

    try {
      // Si se marca como portada, quitar portada a otras imágenes del mismo archivo
      if (es_portada && !imagenActual.es_portada) {
        await pool.query(
          'UPDATE imagenes_archivo SET es_portada = false WHERE id_archivo = $1 AND id_imagenes_archivo != $2',
          [imagenActual.id_archivo, id]
        );
      }

      // Construir query dinámico
      let updateFields = [];
      let values = [];
      let paramCount = 1;

      if (url_imagen) {
        updateFields.push(`url_imagen = $${paramCount}`);
        values.push(url_imagen.trim());
        paramCount++;
      }

      if (orden !== undefined) {
        updateFields.push(`orden = $${paramCount}`);
        values.push(orden);
        paramCount++;
      }

      if (es_portada !== undefined) {
        updateFields.push(`es_portada = $${paramCount}`);
        values.push(es_portada);
        paramCount++;
      }

      if (updateFields.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      }

      values.push(id);

      const result = await pool.query(`
        UPDATE imagenes_archivo 
        SET ${updateFields.join(', ')}
        WHERE id_imagenes_archivo = $${paramCount}
        RETURNING *
      `, values);

      await pool.query('COMMIT');

      const updatedImagen = result.rows[0];
      console.log(`Imagen actualizada: ${updatedImagen.url_imagen}`);
      
      res.json({
        message: 'Imagen actualizada exitosamente',
        imagen: updatedImagen
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error al actualizar imagen:', error);
    res.status(500).json({ error: 'Error al actualizar imagen' });
  }
};

// Marcar imagen como portada
exports.setPortada = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que existe la imagen
    const exists = await pool.query(
      'SELECT * FROM imagenes_archivo WHERE id_imagenes_archivo = $1',
      [id]
    );

    if (exists.rows.length === 0) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    const imagen = exists.rows[0];

    await pool.query('BEGIN');

    try {
      // Quitar portada a todas las imágenes del archivo
      await pool.query(
        'UPDATE imagenes_archivo SET es_portada = false WHERE id_archivo = $1',
        [imagen.id_archivo]
      );

      // Marcar esta imagen como portada
      const result = await pool.query(
        'UPDATE imagenes_archivo SET es_portada = true WHERE id_imagenes_archivo = $1 RETURNING *',
        [id]
      );

      await pool.query('COMMIT');

      console.log(`Nueva portada establecida: ${result.rows[0].url_imagen}`);
      
      res.json({
        message: 'Portada establecida exitosamente',
        imagen: result.rows[0]
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error al establecer portada:', error);
    res.status(500).json({ error: 'Error al establecer portada' });
  }
};

// Reordenar imágenes
exports.reordenarImagenes = async (req, res) => {
  try {
    const { archivo_id } = req.params;
    const { imagenesOrden } = req.body; // Array de {id, orden}

    if (!Array.isArray(imagenesOrden) || imagenesOrden.length === 0) {
      return res.status(400).json({ error: 'Array de imágenes con orden requerido' });
    }

    // Verificar que existe el archivo
    const archivoExists = await pool.query(
      'SELECT * FROM archivos WHERE id_archivo = $1',
      [archivo_id]
    );

    if (archivoExists.rows.length === 0) {
      return res.status(400).json({ error: 'Archivo no encontrado' });
    }

    await pool.query('BEGIN');

    try {
      // Actualizar orden de cada imagen
      for (const item of imagenesOrden) {
        await pool.query(
          'UPDATE imagenes_archivo SET orden = $1 WHERE id_imagenes_archivo = $2 AND id_archivo = $3',
          [item.orden, item.id, archivo_id]
        );
      }

      await pool.query('COMMIT');

      // Obtener imágenes reordenadas
      const result = await pool.query(
        'SELECT * FROM imagenes_archivo WHERE id_archivo = $1 ORDER BY orden ASC',
        [archivo_id]
      );

      console.log(`Imágenes reordenadas para archivo ${archivo_id}`);
      
      res.json({
        message: 'Imágenes reordenadas exitosamente',
        imagenes: result.rows
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error al reordenar imágenes:', error);
    res.status(500).json({ error: 'Error al reordenar imágenes' });
  }
};

// Eliminar imagen
exports.deleteImagen = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que existe
    const exists = await pool.query(
      'SELECT * FROM imagenes_archivo WHERE id_imagenes_archivo = $1',
      [id]
    );

    if (exists.rows.length === 0) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    const imagen = exists.rows[0];

    // Eliminar imagen
    const deleted = await pool.query(
      'DELETE FROM imagenes_archivo WHERE id_imagenes_archivo = $1 RETURNING *',
      [id]
    );

    console.log(`Imagen eliminada: ${deleted.rows[0].url_imagen}`);
    
    res.json({
      message: 'Imagen eliminada exitosamente',
      imagen: deleted.rows[0]
    });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({ error: 'Error al eliminar imagen' });
  }
};

// Obtener portada de un archivo
exports.getPortadaArchivo = async (req, res) => {
  try {
    const { archivo_id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM imagenes_archivo WHERE id_archivo = $1 AND es_portada = true',
      [archivo_id]
    );

    if (result.rows.length === 0) {
      // Si no hay portada, devolver la primera imagen
      const primeraImagen = await pool.query(
        'SELECT * FROM imagenes_archivo WHERE id_archivo = $1 ORDER BY orden ASC, id_imagenes_archivo ASC LIMIT 1',
        [archivo_id]
      );

      if (primeraImagen.rows.length === 0) {
        return res.status(404).json({ error: 'No hay imágenes para este archivo' });
      }

      return res.json(primeraImagen.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener portada:', error);
    res.status(500).json({ error: 'Error al obtener portada' });
  }
};