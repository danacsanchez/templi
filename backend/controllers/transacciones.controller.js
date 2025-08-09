const pool = require('../db');

exports.getTransacciones = async (req, res) => {
  try {
    const { 
      cliente_id, 
      estado, 
      metodo_pago, 
      fecha_desde, 
      fecha_hasta,
      page = 1, 
      limit = 20 
    } = req.query;
    
    let query = `
      SELECT 
        t.*,
        c.id_usuario as cliente_usuario_id,
        u.nombre as cliente_nombre,
        u.email as cliente_email,
        et.estado as estado_nombre,
        mp.nombre as metodo_pago_nombre
      FROM transacciones t
      JOIN cliente c ON t.id_cliente = c.id_cliente
      JOIN usuarios u ON c.id_usuario = u.id_usuario
      JOIN estado_transaccion et ON t.id_estado_transaccion = et.id_estado_transaccion
      JOIN metodos_pago mp ON t.id_metodos_pago = mp.id_metodos_pago
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    if (cliente_id) {
      query += ` AND t.id_cliente = $${paramCount}`;
      params.push(cliente_id);
      paramCount++;
    }

    if (estado) {
      query += ` AND t.id_estado_transaccion = $${paramCount}`;
      params.push(estado);
      paramCount++;
    }

    if (metodo_pago) {
      query += ` AND t.id_metodos_pago = $${paramCount}`;
      params.push(metodo_pago);
      paramCount++;
    }

    if (fecha_desde) {
      query += ` AND DATE(t.fecha_compra) >= $${paramCount}`;
      params.push(fecha_desde);
      paramCount++;
    }

    if (fecha_hasta) {
      query += ` AND DATE(t.fecha_compra) <= $${paramCount}`;
      params.push(fecha_hasta);
      paramCount++;
    }

    const offset = (page - 1) * limit;
    query += ` ORDER BY t.fecha_compra DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    let countQuery = `
      SELECT COUNT(*) as total
      FROM transacciones t
      WHERE 1=1
    `;
    
    const countParams = [];
    let countParamCount = 1;

    if (cliente_id) {
      countQuery += ` AND t.id_cliente = $${countParamCount}`;
      countParams.push(cliente_id);
      countParamCount++;
    }

    if (estado) {
      countQuery += ` AND t.id_estado_transaccion = $${countParamCount}`;
      countParams.push(estado);
      countParamCount++;
    }

    if (metodo_pago) {
      countQuery += ` AND t.id_metodos_pago = $${countParamCount}`;
      countParams.push(metodo_pago);
      countParamCount++;
    }

    if (fecha_desde) {
      countQuery += ` AND DATE(t.fecha_compra) >= $${countParamCount}`;
      countParams.push(fecha_desde);
      countParamCount++;
    }

    if (fecha_hasta) {
      countQuery += ` AND DATE(t.fecha_compra) <= $${countParamCount}`;
      countParams.push(fecha_hasta);
      countParamCount++;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    console.log(`Transacciones obtenidas: ${result.rows.length} de ${total} total`);
    
    res.json({
      transacciones: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    res.status(500).json({ error: 'Error al obtener transacciones' });
  }
};

exports.getTransaccionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaccionResult = await pool.query(`
      SELECT 
        t.*,
        c.id_usuario as cliente_usuario_id,
        u.nombre as cliente_nombre,
        u.email as cliente_email,
        et.estado as estado_nombre,
        mp.nombre as metodo_pago_nombre
      FROM transacciones t
      JOIN cliente c ON t.id_cliente = c.id_cliente
      JOIN usuarios u ON c.id_usuario = u.id_usuario
      JOIN estado_transaccion et ON t.id_estado_transaccion = et.id_estado_transaccion
      JOIN metodos_pago mp ON t.id_metodos_pago = mp.id_metodos_pago
      WHERE t.id_transacciones = $1
    `, [id]);

    if (transaccionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    const detallesResult = await pool.query(`
      SELECT 
        dt.*,
        a.nombre_archivo,
        a.descripcion as archivo_descripcion,
        a.ruta_archivo,
        v.id_usuario as vendedor_usuario_id,
        u.nombre as vendedor_nombre,
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
    `, [id]);

    const transaccion = {
      ...transaccionResult.rows[0],
      detalles: detallesResult.rows
    };

    console.log(`Transacción encontrada: ${transaccion.id_transacciones} con ${detallesResult.rows.length} archivos`);
    res.json(transaccion);
  } catch (error) {
    console.error('Error al obtener transacción:', error);
    res.status(500).json({ error: 'Error al obtener transacción' });
  }
};

exports.getTransaccionesCliente = async (req, res) => {
  try {
    const { cliente_id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const clienteExists = await pool.query(
      'SELECT * FROM cliente WHERE id_cliente = $1',
      [cliente_id]
    );

    if (clienteExists.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT 
        t.*,
        et.estado as estado_nombre,
        mp.nombre as metodo_pago_nombre
      FROM transacciones t
      JOIN estado_transaccion et ON t.id_estado_transaccion = et.id_estado_transaccion
      JOIN metodos_pago mp ON t.id_metodos_pago = mp.id_metodos_pago
      WHERE t.id_cliente = $1
      ORDER BY t.fecha_compra DESC
      LIMIT $2 OFFSET $3
    `, [cliente_id, limit, offset]);

    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM transacciones WHERE id_cliente = $1',
      [cliente_id]
    );

    const total = parseInt(countResult.rows[0].total);
    
    console.log(`Transacciones del cliente ${cliente_id}: ${result.rows.length} de ${total} total`);
    
    res.json({
      transacciones: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener transacciones del cliente:', error);
    res.status(500).json({ error: 'Error al obtener transacciones del cliente' });
  }
};

exports.updateEstadoTransaccion = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_estado_transaccion, notas } = req.body;

    if (!id_estado_transaccion) {
      return res.status(400).json({ error: 'El estado de transacción es requerido' });
    }

    const transaccionExists = await pool.query(
      'SELECT * FROM transacciones WHERE id_transacciones = $1',
      [id]
    );

    if (transaccionExists.rows.length === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    const estadoExists = await pool.query(
      'SELECT * FROM estado_transaccion WHERE id_estado_transaccion = $1',
      [id_estado_transaccion]
    );

    if (estadoExists.rows.length === 0) {
      return res.status(400).json({ error: 'Estado de transacción no válido' });
    }

    const result = await pool.query(`
      UPDATE transacciones 
      SET id_estado_transaccion = $1
      WHERE id_transacciones = $2 
      RETURNING *
    `, [id_estado_transaccion, id]);

    const updatedTransaccion = result.rows[0];
    console.log(`Estado de transacción ${id} actualizado a estado ${id_estado_transaccion}`);
    
    res.json({
      message: 'Estado de transacción actualizado exitosamente',
      transaccion: updatedTransaccion,
      notas: notas || null
    });
  } catch (error) {
    console.error('Error al actualizar estado de transacción:', error);
    res.status(500).json({ error: 'Error al actualizar estado de transacción' });
  }
};

exports.getEstadisticasTransacciones = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;

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

    const estadoStats = await pool.query(`
      SELECT 
        et.estado,
        COUNT(*) as cantidad,
        COALESCE(SUM(t.total_pago), 0) as total_monto
      FROM transacciones t
      JOIN estado_transaccion et ON t.id_estado_transaccion = et.id_estado_transaccion
      ${whereClause}
      GROUP BY et.id_estado_transaccion, et.estado
      ORDER BY cantidad DESC
    `, params);

    const metodoPagoStats = await pool.query(`
      SELECT 
        mp.nombre as metodo_pago,
        COUNT(*) as cantidad,
        COALESCE(SUM(t.total_pago), 0) as total_monto
      FROM transacciones t
      JOIN metodos_pago mp ON t.id_metodos_pago = mp.id_metodos_pago
      ${whereClause}
      GROUP BY mp.id_metodos_pago, mp.nombre
      ORDER BY cantidad DESC
    `, params);

    const totalesResult = await pool.query(`
      SELECT 
        COUNT(*) as total_transacciones,
        COALESCE(SUM(total_pago), 0) as total_ingresos,
        COALESCE(AVG(total_pago), 0) as promedio_transaccion
      FROM transacciones t
      ${whereClause}
    `, params);

    const totales = totalesResult.rows[0];

    console.log('Estadísticas de transacciones obtenidas');
    
    res.json({
      totales: {
        total_transacciones: parseInt(totales.total_transacciones),
        total_ingresos: parseFloat(totales.total_ingresos),
        promedio_transaccion: parseFloat(totales.promedio_transaccion)
      },
      por_estado: estadoStats.rows,
      por_metodo_pago: metodoPagoStats.rows
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

exports.createTransaccionPayPal = async (req, res) => {
  try {
    const {
      id_archivo,
      id_comprador,
      monto,
      paypal_transaction_id,
      paypal_payer_email,
      paypal_payer_name,
      estado_transaccion = 'completada'
    } = req.body;

    if (!id_archivo || !id_comprador || !monto || !paypal_transaction_id) {
      return res.status(400).json({
        error: 'Campos requeridos: id_archivo, id_comprador, monto, paypal_transaction_id'
      });
    }

    const archivoExists = await pool.query(
      'SELECT * FROM archivos WHERE id_archivo = $1 AND activo = true',
      [id_archivo]
    );

    if (archivoExists.rows.length === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado o inactivo' });
    }

    const archivo = archivoExists.rows[0];

    const clienteResult = await pool.query(
      'SELECT id_cliente FROM cliente WHERE id_usuario = $1',
      [id_comprador]
    );

    if (clienteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario comprador no es un cliente registrado' });
    }

    const id_cliente = clienteResult.rows[0].id_cliente;

    const existingTransaction = await pool.query(
      'SELECT * FROM transacciones WHERE referencia_pago = $1',
      [paypal_transaction_id]
    );

    if (existingTransaction.rows.length > 0) {
      return res.status(400).json({
        error: 'Esta transacción PayPal ya fue registrada'
      });
    }

    const paypalMethod = await pool.query(
      'SELECT * FROM metodos_pago WHERE nombre ILIKE $1',
      ['%paypal%']
    );

    let id_metodos_pago = null;
    if (paypalMethod.rows.length === 0) {
      const newMethod = await pool.query(
        'INSERT INTO metodos_pago (nombre, descripcion, activo) VALUES ($1, $2, $3) RETURNING id_metodos_pago',
        ['PayPal', 'Pago a través de PayPal', true]
      );
      id_metodos_pago = newMethod.rows[0].id_metodos_pago;
    } else {
      id_metodos_pago = paypalMethod.rows[0].id_metodos_pago;
    }

    const estadoResult = await pool.query(
      'SELECT id_estado_transaccion FROM estado_transaccion WHERE estado ILIKE $1',
      ['completada']
    );

    let id_estado_transaccion = null;
    if (estadoResult.rows.length === 0) {
      const newEstado = await pool.query(
        'INSERT INTO estado_transaccion (estado, descripcion) VALUES ($1, $2) RETURNING id_estado_transaccion',
        ['Completada', 'Transacción completada exitosamente']
      );
      id_estado_transaccion = newEstado.rows[0].id_estado_transaccion;
    } else {
      id_estado_transaccion = estadoResult.rows[0].id_estado_transaccion;
    }

    const transactionResult = await pool.query(
      `INSERT INTO transacciones 
       (id_cliente, id_metodos_pago, id_estado_transaccion, total_pago, fecha_compra, referencia_pago)
       VALUES ($1, $2, $3, $4, NOW(), $5)
       RETURNING *`,
      [id_cliente, id_metodos_pago, id_estado_transaccion, monto, paypal_transaction_id]
    );

    const nuevaTransaccion = transactionResult.rows[0];

    await pool.query(
      `INSERT INTO detalle_transaccion 
       (id_transacciones, id_archivo, precio_unitario)
       VALUES ($1, $2, $3)`,
      [
        nuevaTransaccion.id_transacciones,
        id_archivo,
        monto
      ]
    );

    
    res.status(201).json({
      message: 'Transacción PayPal creada exitosamente',
      transaccion: nuevaTransaccion
    });

  } catch (error) {
    console.error('Error creando transacción PayPal:', error);
    res.status(500).json({
      error: 'Error interno del servidor al crear la transacción PayPal'
    });
  }
};

exports.verificarCompraArchivo = async (req, res) => {
  try {
    const { userId, archivoId } = req.params;

    const clienteResult = await pool.query(
      'SELECT id_cliente FROM cliente WHERE id_usuario = $1',
      [userId]
    );

    if (clienteResult.rows.length === 0) {
      return res.json({
        ha_comprado: false,
        transaccion: null
      });
    }

    const id_cliente = clienteResult.rows[0].id_cliente;

    const result = await pool.query(
      `SELECT t.*, dt.id_archivo, dt.precio_unitario
       FROM transacciones t
       INNER JOIN detalle_transaccion dt ON t.id_transacciones = dt.id_transacciones
       WHERE t.id_cliente = $1 AND dt.id_archivo = $2`,
      [id_cliente, archivoId]
    );

    const haComprado = result.rows.length > 0;

    res.json({
      ha_comprado: haComprado,
      transaccion: haComprado ? result.rows[0] : null
    });
  } catch (error) {
    console.error('Error verificando compra:', error);
    res.status(500).json({
      error: 'Error al verificar compra'
    });
  }
};