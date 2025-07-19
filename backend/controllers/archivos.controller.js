const pool = require('../db');

// Obtener todos los archivos (públicos y activos)
exports.getArchivos = async (req, res) => {
  try {
    const { categoria, extension, precio_min, precio_max, search } = req.query;
    
    let query = `
      SELECT 
        a.*,
        v.id_usuario as vendedor_usuario_id,
        u.nombre as vendedor_nombre,
        ca.nombre as categoria_nombre,
        ea.nombre as extension_nombre
      FROM archivos a
      JOIN vendedor v ON a.id_vendedor = v.id_vendedor
      JOIN usuarios u ON v.id_usuario = u.id_usuario
      JOIN categoria_archivo ca ON a.id_categoria_archivo = ca.id_categoria_archivo
      JOIN extension_archivo ea ON a.id_extension_archivo = ea.id_extension_archivo
      WHERE a.activo = true
    `;
    
    const params = [];
    let paramCount = 1;

    // Filtros opcionales
    if (categoria) {
      query += ` AND a.id_categoria_archivo = $${paramCount}`;
      params.push(categoria);
      paramCount++;
    }

    if (extension) {
      query += ` AND a.id_extension_archivo = $${paramCount}`;
      params.push(extension);
      paramCount++;
    }

    if (precio_min) {
      query += ` AND a.precio >= $${paramCount}`;
      params.push(precio_min);
      paramCount++;
    }

    if (precio_max) {
      query += ` AND a.precio <= $${paramCount}`;
      params.push(precio_max);
      paramCount++;
    }

    if (search) {
      query += ` AND (LOWER(a.nombre_archivo) LIKE LOWER($${paramCount}) OR LOWER(a.descripcion) LIKE LOWER($${paramCount}))`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY a.fecha_subida DESC`;

    const result = await pool.query(query, params);
    
    console.log(`Archivos obtenidos: ${result.rows.length}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener archivos:', error);
    res.status(500).json({ error: 'Error al obtener archivos' });
  }
};

// Obtener archivo por ID
exports.getArchivoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        a.*,
        v.id_usuario as vendedor_usuario_id,
        u.nombre as vendedor_nombre,
        ca.nombre as categoria_nombre,
        ea.nombre as extension_nombre
      FROM archivos a
      JOIN vendedor v ON a.id_vendedor = v.id_vendedor
      JOIN usuarios u ON v.id_usuario = u.id_usuario
      JOIN categoria_archivo ca ON a.id_categoria_archivo = ca.id_categoria_archivo
      JOIN extension_archivo ea ON a.id_extension_archivo = ea.id_extension_archivo
      WHERE a.id_archivo = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    // Obtener imágenes del archivo
    const imagenes = await pool.query(
      'SELECT * FROM imagenes_archivo WHERE id_archivo = $1 ORDER BY orden, id_imagenes_archivo',
      [id]
    );

    const archivo = {
      ...result.rows[0],
      imagenes: imagenes.rows
    };

    console.log(`Archivo encontrado: ${archivo.nombre_archivo}`);
    res.json(archivo);
  } catch (error) {
    console.error('Error al obtener archivo:', error);
    res.status(500).json({ error: 'Error al obtener archivo' });
  }
};

// Obtener archivos del vendedor autenticado
exports.getMisArchivos = async (req, res) => {
  try {
    // TODO: Obtener vendedor_id del token de autenticación
    // Por ahora simulamos con query param
    const { vendedor_id } = req.query;
    
    if (!vendedor_id) {
      return res.status(400).json({ error: 'ID de vendedor requerido' });
    }

    const result = await pool.query(`
      SELECT 
        a.*,
        ca.nombre as categoria_nombre,
        ea.nombre as extension_nombre
      FROM archivos a
      JOIN categoria_archivo ca ON a.id_categoria_archivo = ca.id_categoria_archivo
      JOIN extension_archivo ea ON a.id_extension_archivo = ea.id_extension_archivo
      WHERE a.id_vendedor = $1
      ORDER BY a.fecha_subida DESC
    `, [vendedor_id]);
    
    console.log(`Archivos del vendedor ${vendedor_id}: ${result.rows.length}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener archivos del vendedor:', error);
    res.status(500).json({ error: 'Error al obtener archivos del vendedor' });
  }
};

// Crear nuevo archivo
exports.createArchivo = async (req, res) => {
  try {
    const {
      id_vendedor,
      id_extension_archivo,
      id_categoria_archivo,
      nombre_archivo,
      descripcion,
      ruta_archivo,
      precio
    } = req.body;

    // Validaciones básicas
    if (!id_vendedor || !id_extension_archivo || !id_categoria_archivo || 
        !nombre_archivo || !descripcion || !ruta_archivo || !precio) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (precio < 0) {
      return res.status(400).json({ error: 'El precio debe ser mayor o igual a 0' });
    }

    // Verificar que existe el vendedor
    const vendedorExists = await pool.query(
      'SELECT * FROM vendedor WHERE id_vendedor = $1',
      [id_vendedor]
    );

    if (vendedorExists.rows.length === 0) {
      return res.status(400).json({ error: 'Vendedor no encontrado' });
    }

    // Verificar que existe la categoría
    const categoriaExists = await pool.query(
      'SELECT * FROM categoria_archivo WHERE id_categoria_archivo = $1',
      [id_categoria_archivo]
    );

    if (categoriaExists.rows.length === 0) {
      return res.status(400).json({ error: 'Categoría no encontrada' });
    }

    // Verificar que existe la extensión
    const extensionExists = await pool.query(
      'SELECT * FROM extension_archivo WHERE id_extension_archivo = $1',
      [id_extension_archivo]
    );

    if (extensionExists.rows.length === 0) {
      return res.status(400).json({ error: 'Extensión no encontrada' });
    }

    // Crear archivo
    const result = await pool.query(`
      INSERT INTO archivos (
        id_vendedor, 
        id_extension_archivo, 
        id_categoria_archivo, 
        nombre_archivo, 
        descripcion, 
        ruta_archivo, 
        precio,
        fecha_subida,
        num_descargas,
        activo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), 0, true) 
      RETURNING *
    `, [
      id_vendedor,
      id_extension_archivo,
      id_categoria_archivo,
      nombre_archivo.trim(),
      descripcion.trim(),
      ruta_archivo.trim(),
      precio
    ]);

    const newArchivo = result.rows[0];
    console.log(`Archivo creado: ${newArchivo.nombre_archivo}`);
    
    res.status(201).json({
      message: 'Archivo creado exitosamente',
      archivo: newArchivo
    });
  } catch (error) {
    console.error('Error al crear archivo:', error);
    res.status(500).json({ error: 'Error al crear archivo' });
  }
};

// Actualizar archivo
exports.updateArchivo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_extension_archivo,
      id_categoria_archivo,
      nombre_archivo,
      descripcion,
      precio
    } = req.body;

    // Verificar que existe el archivo
    const exists = await pool.query(
      'SELECT * FROM archivos WHERE id_archivo = $1',
      [id]
    );

    if (exists.rows.length === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    // Validaciones básicas
    if (!nombre_archivo || !descripcion || precio === undefined) {
      return res.status(400).json({ error: 'Nombre, descripción y precio son requeridos' });
    }

    if (precio < 0) {
      return res.status(400).json({ error: 'El precio debe ser mayor o igual a 0' });
    }

    // Verificar categoría si se proporciona
    if (id_categoria_archivo) {
      const categoriaExists = await pool.query(
        'SELECT * FROM categoria_archivo WHERE id_categoria_archivo = $1',
        [id_categoria_archivo]
      );

      if (categoriaExists.rows.length === 0) {
        return res.status(400).json({ error: 'Categoría no encontrada' });
      }
    }

    // Verificar extensión si se proporciona
    if (id_extension_archivo) {
      const extensionExists = await pool.query(
        'SELECT * FROM extension_archivo WHERE id_extension_archivo = $1',
        [id_extension_archivo]
      );

      if (extensionExists.rows.length === 0) {
        return res.status(400).json({ error: 'Extensión no encontrada' });
      }
    }

    // Construir query dinámico
    let updateFields = [];
    let values = [];
    let paramCount = 1;

    if (nombre_archivo) {
      updateFields.push(`nombre_archivo = $${paramCount}`);
      values.push(nombre_archivo.trim());
      paramCount++;
    }

    if (descripcion) {
      updateFields.push(`descripcion = $${paramCount}`);
      values.push(descripcion.trim());
      paramCount++;
    }

    if (precio !== undefined) {
      updateFields.push(`precio = $${paramCount}`);
      values.push(precio);
      paramCount++;
    }

    if (id_categoria_archivo) {
      updateFields.push(`id_categoria_archivo = $${paramCount}`);
      values.push(id_categoria_archivo);
      paramCount++;
    }

    if (id_extension_archivo) {
      updateFields.push(`id_extension_archivo = $${paramCount}`);
      values.push(id_extension_archivo);
      paramCount++;
    }

    values.push(id);

    const result = await pool.query(`
      UPDATE archivos 
      SET ${updateFields.join(', ')}
      WHERE id_archivo = $${paramCount}
      RETURNING *
    `, values);

    const updatedArchivo = result.rows[0];
    console.log(`Archivo actualizado: ${updatedArchivo.nombre_archivo}`);
    
    res.json({
      message: 'Archivo actualizado exitosamente',
      archivo: updatedArchivo
    });
  } catch (error) {
    console.error('Error al actualizar archivo:', error);
    res.status(500).json({ error: 'Error al actualizar archivo' });
  }
};

// Cambiar estado activo/inactivo
exports.toggleArchivoEstado = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que existe el archivo
    const exists = await pool.query(
      'SELECT * FROM archivos WHERE id_archivo = $1',
      [id]
    );

    if (exists.rows.length === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    // Cambiar estado
    const result = await pool.query(
      'UPDATE archivos SET activo = NOT activo WHERE id_archivo = $1 RETURNING *',
      [id]
    );

    const updatedArchivo = result.rows[0];
    const estado = updatedArchivo.activo ? 'activado' : 'desactivado';
    
    console.log(`Archivo ${estado}: ${updatedArchivo.nombre_archivo}`);
    
    res.json({
      message: `Archivo ${estado} exitosamente`,
      archivo: updatedArchivo
    });
  } catch (error) {
    console.error('Error al cambiar estado del archivo:', error);
    res.status(500).json({ error: 'Error al cambiar estado del archivo' });
  }
};

// Eliminar archivo (soft delete - cambiar a inactivo)
exports.deleteArchivo = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que existe
    const exists = await pool.query(
      'SELECT * FROM archivos WHERE id_archivo = $1',
      [id]
    );

    if (exists.rows.length === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    // Verificar si está en transacciones
    const inTransactions = await pool.query(
      'SELECT COUNT(*) as count FROM detalle_transaccion WHERE id_archivo = $1',
      [id]
    );

    if (parseInt(inTransactions.rows[0].count) > 0) {
      // Si está en transacciones, solo desactivar
      const result = await pool.query(
        'UPDATE archivos SET activo = false WHERE id_archivo = $1 RETURNING *',
        [id]
      );

      console.log(`Archivo desactivado (tiene transacciones): ${result.rows[0].nombre_archivo}`);
      
      return res.json({
        message: 'Archivo desactivado (tiene transacciones asociadas)',
        archivo: result.rows[0]
      });
    }

    // Si no tiene transacciones, eliminar completamente
    const deleted = await pool.query(
      'DELETE FROM archivos WHERE id_archivo = $1 RETURNING *',
      [id]
    );

    console.log(`Archivo eliminado: ${deleted.rows[0].nombre_archivo}`);
    
    res.json({
      message: 'Archivo eliminado exitosamente',
      archivo: deleted.rows[0]
    });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({ error: 'Error al eliminar archivo' });
  }
};

// Incrementar contador de descargas
exports.incrementarDescargas = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE archivos SET num_descargas = num_descargas + 1 WHERE id_archivo = $1 RETURNING num_descargas',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    console.log(`Descarga registrada para archivo ${id}: ${result.rows[0].num_descargas} descargas`);
    
    res.json({
      message: 'Descarga registrada',
      num_descargas: result.rows[0].num_descargas
    });
  } catch (error) {
    console.error('Error al incrementar descargas:', error);
    res.status(500).json({ error: 'Error al incrementar descargas' });
  }
};
