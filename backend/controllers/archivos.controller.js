const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar multer para manejar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Asegúrate de que esta carpeta exista
  },
  filename: function (req, file, cb) {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB límite
  }
});

// Middleware para subir archivos
exports.uploadMiddleware = upload.fields([
  { name: 'archivo_producto', maxCount: 1 },
  { name: 'imagenes', maxCount: 10 }
]);

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
        ea.nombre as extension_nombre,
        (SELECT url_imagen 
         FROM imagenes_archivo ia 
         WHERE ia.id_archivo = a.id_archivo 
           AND ia.es_portada = true 
         LIMIT 1) as imagen_portada
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

// Obtener archivos de un vendedor específico (para dashboard del vendedor)
exports.getArchivosByVendedor = async (req, res) => {
  try {
    const { vendedorId } = req.params;
    const { categoria, extension, precio_min, precio_max, search } = req.query;
    
    let query = `
      SELECT 
        a.*,
        v.id_usuario as vendedor_usuario_id,
        u.nombre as vendedor_nombre,
        ca.nombre as categoria_nombre,
        ea.nombre as extension_nombre,
        (SELECT url_imagen 
         FROM imagenes_archivo ia 
         WHERE ia.id_archivo = a.id_archivo 
           AND ia.es_portada = true 
         LIMIT 1) as imagen_portada
      FROM archivos a
      JOIN vendedor v ON a.id_vendedor = v.id_vendedor
      JOIN usuarios u ON v.id_usuario = u.id_usuario
      JOIN categoria_archivo ca ON a.id_categoria_archivo = ca.id_categoria_archivo
      JOIN extension_archivo ea ON a.id_extension_archivo = ea.id_extension_archivo
      WHERE a.id_vendedor = $1
    `;
    
    const params = [vendedorId];
    let paramCount = 2;

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
    
    console.log(`Archivos del vendedor ${vendedorId} obtenidos: ${result.rows.length}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener archivos del vendedor:', error);
    res.status(500).json({ error: 'Error al obtener archivos del vendedor' });
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
    console.log('=== DEBUGGING BACKEND ===');
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    
    const {
      id_vendedor,
      id_extension_archivo,
      id_categoria_archivo,
      nombre_archivo,
      descripcion,
      ruta_archivo,
      precio
    } = req.body;

    console.log('Datos extraídos:', {
      id_vendedor,
      id_extension_archivo,
      id_categoria_archivo,
      nombre_archivo,
      descripcion,
      ruta_archivo,
      precio
    });

    // Validaciones básicas
    if (!id_vendedor || !id_extension_archivo || !id_categoria_archivo || 
        !nombre_archivo || !descripcion || !precio) {
      console.log('Faltan campos obligatorios');
      return res.status(400).json({ 
        error: 'Campos obligatorios: id_vendedor, id_extension_archivo, id_categoria_archivo, nombre_archivo, descripcion, precio'
      });
    }

    if (parseFloat(precio) < 0) {
      return res.status(400).json({ error: 'El precio debe ser mayor o igual a 0' });
    }

    // Obtener nombre del archivo subido si existe
    let rutaArchivoFinal = ruta_archivo || 'archivo_temporal.pdf';
    if (req.files && req.files.archivo_producto && req.files.archivo_producto[0]) {
      rutaArchivoFinal = req.files.archivo_producto[0].filename;
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
      rutaArchivoFinal,
      parseFloat(precio)
    ]);

    const newArchivo = result.rows[0];
    console.log(`Archivo creado: ${newArchivo.nombre_archivo}, ID: ${newArchivo.id_archivo}`);
    
    // Procesar imágenes si existen
    if (req.body.imagenes_metadata) {
      try {
        const imagenesMetadata = JSON.parse(req.body.imagenes_metadata);
        console.log('Metadata de imágenes:', imagenesMetadata);
        
        if (req.files && req.files.imagenes) {
          for (let i = 0; i < req.files.imagenes.length && i < imagenesMetadata.length; i++) {
            const imagen = req.files.imagenes[i];
            const metadata = imagenesMetadata[i];
            
            await pool.query(`
              INSERT INTO imagenes_archivo (
                id_archivo, 
                url_imagen, 
                orden, 
                es_portada
              ) VALUES ($1, $2, $3, $4)
            `, [
              newArchivo.id_archivo,
              imagen.filename,
              metadata.orden || (i + 1),
              metadata.es_portada || false
            ]);
          }
        }
      } catch (e) {
        console.warn('Error procesando imágenes:', e);
      }
    }
    
    res.status(201).json({
      message: 'Archivo creado exitosamente',
      archivo: newArchivo
    });
  } catch (error) {
    console.error('Error al crear archivo:', error);
    res.status(500).json({ error: 'Error al crear archivo: ' + error.message });
  }
};

// Actualizar archivo
exports.updateArchivo = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('=== ACTUALIZANDO ARCHIVO ===');
    console.log('ID del archivo:', id);
    console.log('Body recibido:', req.body);
    console.log('Files recibidos:', req.files);

    // Extraer datos del FormData
    const {
      nombre_archivo,
      descripcion,
      precio,
      id_categoria_archivo,
      id_extension_archivo
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

    if (parseFloat(precio) < 0) {
      return res.status(400).json({ error: 'El precio debe ser mayor o igual a 0' });
    }

    // Verificar categoría
    const categoriaExists = await pool.query(
      'SELECT * FROM categoria_archivo WHERE id_categoria_archivo = $1',
      [id_categoria_archivo]
    );

    if (categoriaExists.rows.length === 0) {
      return res.status(400).json({ error: 'Categoría no encontrada' });
    }

    // Verificar extensión
    const extensionExists = await pool.query(
      'SELECT * FROM extension_archivo WHERE id_extension_archivo = $1',
      [id_extension_archivo]
    );

    if (extensionExists.rows.length === 0) {
      return res.status(400).json({ error: 'Extensión no encontrada' });
    }

    // Actualizar archivo en la base de datos
    let rutaArchivo = exists.rows[0].ruta_archivo; // Mantener la ruta actual por defecto
    
    // Si se subió un nuevo archivo principal, actualizar la ruta
    if (req.files && req.files.archivo_producto && req.files.archivo_producto[0]) {
      rutaArchivo = req.files.archivo_producto[0].filename;
    }

    const updateResult = await pool.query(`
      UPDATE archivos 
      SET 
        nombre_archivo = $1,
        descripcion = $2,
        precio = $3,
        id_categoria_archivo = $4,
        id_extension_archivo = $5,
        ruta_archivo = $6
      WHERE id_archivo = $7
      RETURNING *
    `, [
      nombre_archivo,
      descripcion,
      parseFloat(precio),
      parseInt(id_categoria_archivo),
      parseInt(id_extension_archivo),
      rutaArchivo,
      id
    ]);

    // Manejar nuevas imágenes si se subieron
    if (req.files && req.files.imagenes_nuevas && req.files.imagenes_nuevas.length > 0) {
      const nuevasImagenesMetadata = req.body.nuevas_imagenes_metadata ? 
        JSON.parse(req.body.nuevas_imagenes_metadata) : [];

      for (let i = 0; i < req.files.imagenes_nuevas.length; i++) {
        const imagen = req.files.imagenes_nuevas[i];
        const metadata = nuevasImagenesMetadata[i] || { orden: i + 1, es_portada: false };

        await pool.query(`
          INSERT INTO imagenes_archivo (id_archivo, url_imagen, orden, es_portada)
          VALUES ($1, $2, $3, $4)
        `, [
          id,
          imagen.filename,
          metadata.orden,
          metadata.es_portada
        ]);
      }
    }

    // Actualizar metadata de imágenes existentes si se proporcionó
    if (req.body.imagenes_existentes_metadata) {
      const imagenesExistentes = JSON.parse(req.body.imagenes_existentes_metadata);
      
      for (const imagen of imagenesExistentes) {
        await pool.query(`
          UPDATE imagenes_archivo 
          SET orden = $1, es_portada = $2
          WHERE id_imagenes_archivo = $3 AND id_archivo = $4
        `, [
          imagen.orden,
          imagen.es_portada,
          imagen.id_imagenes_archivo,
          id
        ]);
      }
    }

    console.log('Archivo actualizado exitosamente:', updateResult.rows[0]);
    res.json({
      message: 'Archivo actualizado exitosamente',
      archivo: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Cambiar estado activo/inactivo
exports.toggleArchivoEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;
    
    // Validar que se envió el campo activo
    if (typeof activo !== 'boolean') {
      return res.status(400).json({ 
        error: 'Se requiere el campo "activo" con valor booleano' 
      });
    }
    
    // Verificar que existe el archivo
    const exists = await pool.query(
      'SELECT * FROM archivos WHERE id_archivo = $1',
      [id]
    );

    if (exists.rows.length === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    // Cambiar estado al valor específico
    const result = await pool.query(
      'UPDATE archivos SET activo = $1 WHERE id_archivo = $2 RETURNING *',
      [activo, id]
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

// Descargar archivo
exports.downloadArchivo = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que existe el archivo en la base de datos
    const result = await pool.query(
      'SELECT * FROM archivos WHERE id_archivo = $1 AND activo = true',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado o no disponible' });
    }

    const archivo = result.rows[0];
    const rutaCompleta = path.join(__dirname, '../uploads', archivo.ruta_archivo);

    console.log('Buscando archivo en:', rutaCompleta);
    console.log('Archivo en BD:', archivo.ruta_archivo);

    // Verificar que el archivo físico existe
    if (!fs.existsSync(rutaCompleta)) {
      console.error(`Archivo físico no encontrado: ${rutaCompleta}`);
      return res.status(404).json({ error: 'Archivo físico no encontrado en el servidor' });
    }

    // Incrementar contador de descargas
    await pool.query(
      'UPDATE archivos SET num_descargas = num_descargas + 1 WHERE id_archivo = $1',
      [id]
    );

    // Obtener información del archivo
    const stats = fs.statSync(rutaCompleta);
    const fileExtension = path.extname(archivo.ruta_archivo);
    const fileName = `${archivo.nombre_archivo}${fileExtension}`;
    
    // Configurar headers para forzar la descarga
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'no-cache');

    console.log(`Iniciando descarga: ${fileName} (${stats.size} bytes)`);

    // Crear stream y enviar el archivo
    const fileStream = fs.createReadStream(rutaCompleta);
    
    fileStream.on('error', (error) => {
      console.error('Error al leer archivo:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error al leer el archivo' });
      }
    });

    fileStream.on('end', () => {
      console.log(`Archivo descargado exitosamente: ${fileName} (ID: ${id})`);
    });

    // Pipe el archivo a la respuesta
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error en descarga de archivo:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};
