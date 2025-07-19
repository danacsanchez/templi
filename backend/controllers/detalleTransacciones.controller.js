const pool = require('../db');

// Obtener todos los detalles de una transacción específica
exports.getDetallesTransaccion = async (req, res) => {
  try {
    const { transaccion_id } = req.params;
    
    // Verificar que existe la transacción
    const transaccionExists = await pool.query(
      'SELECT * FROM transacciones WHERE id_transacciones = $1',
      [transaccion_id]
    );

    if (transaccionExists.rows.length === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    const result = await pool.query(`
      SELECT 
        dt.*,
        a.nombre_archivo,
        a.descripcion as archivo_descripcion,
        a.ruta_archivo,
        a.precio as precio_actual,
        v.id_usuario as vendedor_usuario_id,
        u.nombre as vendedor_nombre,
        u.email as vendedor_email,
        ca.nombre as categoria_nombre,
        ea.nombre as extension_nombre
      FROM detalle_transaccion dt
      JOIN archivos a ON dt.id_archivo = a.id_archivo
      JOIN vendedor v ON a.id_vendedor = v.id_vendedor
      JOIN usuarios u ON v.id_usuario = u.id_usuario
      JOIN categoria_archivo ca ON a.id_categoria_archivo = ca.id_categoria_archivo
      JOIN extension_archivo ea ON a.id_extension_archivo = ea.id_extension_archivo
      WHERE dt.id_transacciones = $1
      ORDER BY dt.id_detalle_transaccion
    `, [transaccion_id]);
    
    console.log(`Detalles de transacción ${transaccion_id}: ${result.rows.length} archivos`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener detalles de transacción:', error);
    res.status(500).json({ error: 'Error al obtener detalles de transacción' });
  }
};

// Obtener detalle específico por ID
exports.getDetalleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        dt.*,
        a.nombre_archivo,
        a.descripcion as archivo_descripcion,
        a.ruta_archivo,
        a.precio as precio_actual,
        v.id_usuario as vendedor_usuario_id,
        u.nombre as vendedor_nombre,
        u.email as vendedor_email,
        ca.nombre as categoria_nombre,
        ea.nombre as extension_nombre,
        t.fecha_compra,
        t.total_pago,
        et.estado as estado_transaccion
      FROM detalle_transaccion dt
      JOIN archivos a ON dt.id_archivo = a.id_archivo
      JOIN vendedor v ON a.id_vendedor = v.id_vendedor
      JOIN usuarios u ON v.id_usuario = u.id_usuario
      JOIN categoria_archivo ca ON a.id_categoria_archivo = ca.id_categoria_archivo
      JOIN extension_archivo ea ON a.id_extension_archivo = ea.id_extension_archivo
      JOIN transacciones t ON dt.id_transacciones = t.id_transacciones
      JOIN estado_transaccion et ON t.id_estado_transaccion = et.id_estado_transaccion
      WHERE dt.id_detalle_transaccion = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Detalle de transacción no encontrado' });
    }

    console.log(`Detalle encontrado: ${result.rows[0].nombre_archivo}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener detalle:', error);
    res.status(500).json({ error: 'Error al obtener detalle' });
  }
};

// Obtener archivos comprados por un cliente específico
exports.getArchivosCompradosCliente = async (req, res) => {
  try {
    const { cliente_id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Verificar que existe el cliente
    const clienteExists = await pool.query(
      'SELECT * FROM cliente WHERE id_cliente = $1',
      [cliente_id]
    );

    if (clienteExists.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT DISTINCT
        a.id_archivo,
        a.nombre_archivo,
        a.descripcion as archivo_descripcion,
        a.ruta_archivo,
        dt.precio_pagado,
        t.fecha_compra,
        t.id_transacciones,
        v.id_usuario as vendedor_usuario_id,
        u.nombre as vendedor_nombre,
        ca.nombre as categoria_nombre,
        ea.nombre as extension_nombre,
        et.estado as estado_transaccion
      FROM detalle_transaccion dt
      JOIN transacciones t ON dt.id_transacciones = t.id_transacciones
      JOIN archivos a ON dt.id_archivo = a.id_archivo
      JOIN vendedor v ON a.id_vendedor = v.id_vendedor
      JOIN usuarios u ON v.id_usuario = u.id_usuario
      JOIN categoria_archivo ca ON a.id_categoria_archivo = ca.id_categoria_archivo
      JOIN extension_archivo ea ON a.id_extension_archivo = ea.id_extension_archivo
      JOIN estado_transaccion et ON t.id_estado_transaccion = et.id_estado_transaccion
      WHERE t.id_cliente = $1 
        AND et.estado = 'Completada'
      ORDER BY t.fecha_compra DESC
      LIMIT $2 OFFSET $3
    `, [cliente_id, limit, offset]);

    // Obtener total para paginación
    const countResult = await pool.query(`
      SELECT COUNT(DISTINCT a.id_archivo) as total
      FROM detalle_transaccion dt
      JOIN transacciones t ON dt.id_transacciones = t.id_transacciones
      JOIN archivos a ON dt.id_archivo = a.id_archivo
      JOIN estado_transaccion et ON t.id_estado_transaccion = et.id_estado_transaccion
      WHERE t.id_cliente = $1 
        AND et.estado = 'Completada'
    `, [cliente_id]);

    const total = parseInt(countResult.rows[0].total);
    
    console.log(`Archivos comprados por cliente ${cliente_id}: ${result.rows.length} de ${total} total`);
    
    res.json({
      archivos: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener archivos comprados:', error);
    res.status(500).json({ error: 'Error al obtener archivos comprados' });
  }
};

// Obtener ventas de un vendedor específico
exports.getVentasVendedor = async (req, res) => {
  try {
    const { vendedor_id } = req.params;
    const { page = 1, limit = 20, fecha_desde, fecha_hasta } = req.query;

    // Verificar que existe el vendedor
    const vendedorExists = await pool.query(
      'SELECT * FROM vendedor WHERE id_vendedor = $1',
      [vendedor_id]
    );

    if (vendedorExists.rows.length === 0) {
      return res.status(404).json({ error: 'Vendedor no encontrado' });
    }

    let whereClause = 'WHERE a.id_vendedor = $1';
    const params = [vendedor_id];
    let paramCount = 2;

    if (fecha_desde) {
      whereClause += ` AND DATE(t.fecha_compra) >= $${paramCount}`;
      params.push(fecha_desde);
      paramCount++;
    }

    if (fecha_hasta) {
      whereClause += ` AND DATE(t.fecha_compra) <= $${paramCount}`;
      params.push(fecha_hasta);
      paramCount++;
    }

    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT 
        dt.*,
        a.nombre_archivo,
        a.descripcion as archivo_descripcion,
        t.fecha_compra,
        t.id_transacciones,
        c.id_usuario as cliente_usuario_id,
        u.nombre as cliente_nombre,
        u.email as cliente_email,
        ca.nombre as categoria_nombre,
        ea.nombre as extension_nombre,
        et.estado as estado_transaccion
      FROM detalle_transaccion dt
      JOIN transacciones t ON dt.id_transacciones = t.id_transacciones
      JOIN archivos a ON dt.id_archivo = a.id_archivo
      JOIN cliente c ON t.id_cliente = c.id_cliente
      JOIN usuarios u ON c.id_usuario = u.id_usuario
      JOIN categoria_archivo ca ON a.id_categoria_archivo = ca.id_categoria_archivo
      JOIN extension_archivo ea ON a.id_extension_archivo = ea.id_extension_archivo
      JOIN estado_transaccion et ON t.id_estado_transaccion = et.id_estado_transaccion
      ${whereClause}
      ORDER BY t.fecha_compra DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `, [...params, limit, offset]);

    // Obtener total y estadísticas
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_ventas,
        COALESCE(SUM(dt.precio_pagado), 0) as total_ingresos,
        COALESCE(AVG(dt.precio_pagado), 0) as promedio_venta
      FROM detalle_transaccion dt
      JOIN transacciones t ON dt.id_transacciones = t.id_transacciones
      JOIN archivos a ON dt.id_archivo = a.id_archivo
      JOIN estado_transaccion et ON t.id_estado_transaccion = et.id_estado_transaccion
      ${whereClause}
        AND et.estado = 'Completada'
    `, params.slice(0, -2)); // Quitar limit y offset

    const stats = statsResult.rows[0];
    
    console.log(`Ventas del vendedor ${vendedor_id}: ${result.rows.length} registros`);
    
    res.json({
      ventas: result.rows,
      estadisticas: {
        total_ventas: parseInt(stats.total_ventas),
        total_ingresos: parseFloat(stats.total_ingresos),
        promedio_venta: parseFloat(stats.promedio_venta)
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(stats.total_ventas),
        pages: Math.ceil(parseInt(stats.total_ventas) / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener ventas del vendedor:', error);
    res.status(500).json({ error: 'Error al obtener ventas del vendedor' });
  }
};

// Obtener archivos más vendidos
exports.getArchivosMasVendidos = async (req, res) => {
  try {
    const { limit = 10, fecha_desde, fecha_hasta } = req.query;

    let whereClause = '';
    const params = [];
    let paramCount = 1;

    if (fecha_desde || fecha_hasta) {
      whereClause = 'WHERE ';
      const conditions = [];

      if (fecha_desde) {
        conditions.push(`DATE(t.fecha_compra) >= $${paramCount}`);
        params.push(fecha_desde);
        paramCount++;
      }

      if (fecha_hasta) {
        conditions.push(`DATE(t.fecha_compra) <= $${paramCount}`);
        params.push(fecha_hasta);
        paramCount++;
      }

      whereClause += conditions.join(' AND ');
    }

    params.push(limit);

    const result = await pool.query(`
      SELECT 
        a.id_archivo,
        a.nombre_archivo,
        a.descripcion as archivo_descripcion,
        a.precio,
        COUNT(dt.id_detalle_transaccion) as total_ventas,
        SUM(dt.precio_pagado) as total_ingresos,
        AVG(dt.precio_pagado) as promedio_precio,
        v.id_usuario as vendedor_usuario_id,
        u.nombre as vendedor_nombre,
        ca.nombre as categoria_nombre,
        ea.nombre as extension_nombre
      FROM detalle_transaccion dt
      JOIN transacciones t ON dt.id_transacciones = t.id_transacciones
      JOIN archivos a ON dt.id_archivo = a.id_archivo
      JOIN vendedor v ON a.id_vendedor = v.id_vendedor
      JOIN usuarios u ON v.id_usuario = u.id_usuario
      JOIN categoria_archivo ca ON a.id_categoria_archivo = ca.id_categoria_archivo
      JOIN extension_archivo ea ON a.id_extension_archivo = ea.id_extension_archivo
      JOIN estado_transaccion et ON t.id_estado_transaccion = et.id_estado_transaccion
      ${whereClause}
      ${whereClause ? 'AND' : 'WHERE'} et.estado = 'Completada'
      GROUP BY a.id_archivo, a.nombre_archivo, a.descripcion, a.precio,
               v.id_usuario, u.nombre, ca.nombre, ea.nombre
      ORDER BY total_ventas DESC, total_ingresos DESC
      LIMIT $${paramCount}
    `, params);
    
    console.log(`Archivos más vendidos: ${result.rows.length} registros`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener archivos más vendidos:', error);
    res.status(500).json({ error: 'Error al obtener archivos más vendidos' });
  }
};