const pool = require('../db');

// Obtener todos los métodos de pago
exports.getMetodosPago = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM metodos_pago ORDER BY id_metodos_pago'
    );
    
    console.log(`Métodos de pago obtenidos: ${result.rows.length}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener métodos de pago:', error);
    res.status(500).json({ error: 'Error al obtener métodos de pago' });
  }
};

// Obtener un método de pago por ID
exports.getMetodoPagoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM metodos_pago WHERE id_metodos_pago = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Método de pago no encontrado' });
    }

    console.log(`Método de pago encontrado: ${result.rows[0].nombre}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener método de pago:', error);
    res.status(500).json({ error: 'Error al obtener método de pago' });
  }
};

// Crear nuevo método de pago
exports.createMetodoPago = async (req, res) => {
  try {
    const { nombre } = req.body;

    // Validación básica
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    // Verificar si ya existe
    const exists = await pool.query(
      'SELECT * FROM metodos_pago WHERE LOWER(nombre) = LOWER($1)',
      [nombre.trim()]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'Este método de pago ya existe' });
    }

    // Crear método de pago
    const result = await pool.query(
      'INSERT INTO metodos_pago (nombre) VALUES ($1) RETURNING *',
      [nombre.trim()]
    );

    const newMetodo = result.rows[0];
    console.log(`Método de pago creado: ${newMetodo.nombre}`);
    
    res.status(201).json({
      message: 'Método de pago creado exitosamente',
      metodoPago: newMetodo
    });
  } catch (error) {
    console.error('Error al crear método de pago:', error);
    res.status(500).json({ error: 'Error al crear método de pago' });
  }
};

// Actualizar método de pago
exports.updateMetodoPago = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    // Validación básica
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    // Verificar si existe el método de pago
    const exists = await pool.query(
      'SELECT * FROM metodos_pago WHERE id_metodos_pago = $1',
      [id]
    );

    if (exists.rows.length === 0) {
      return res.status(404).json({ error: 'Método de pago no encontrado' });
    }

    // Verificar si el nuevo nombre ya existe (excluyendo el actual)
    const nameExists = await pool.query(
      'SELECT * FROM metodos_pago WHERE LOWER(nombre) = LOWER($1) AND id_metodos_pago != $2',
      [nombre.trim(), id]
    );

    if (nameExists.rows.length > 0) {
      return res.status(400).json({ error: 'Este nombre ya está en uso' });
    }

    // Actualizar método de pago
    const result = await pool.query(
      'UPDATE metodos_pago SET nombre = $1 WHERE id_metodos_pago = $2 RETURNING *',
      [nombre.trim(), id]
    );

    const updatedMetodo = result.rows[0];
    console.log(`Método de pago actualizado: ${updatedMetodo.nombre}`);
    
    res.json({
      message: 'Método de pago actualizado exitosamente',
      metodoPago: updatedMetodo
    });
  } catch (error) {
    console.error('Error al actualizar método de pago:', error);
    res.status(500).json({ error: 'Error al actualizar método de pago' });
  }
};

// Eliminar método de pago
exports.deleteMetodoPago = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si existe
    const exists = await pool.query(
      'SELECT * FROM metodos_pago WHERE id_metodos_pago = $1',
      [id]
    );

    if (exists.rows.length === 0) {
      return res.status(404).json({ error: 'Método de pago no encontrado' });
    }

    // Verificar si está siendo usado en transacciones
    const inUse = await pool.query(
      'SELECT COUNT(*) as count FROM transacciones WHERE id_metodos_pago = $1',
      [id]
    );

    if (parseInt(inUse.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar. Este método de pago está siendo usado en transacciones existentes' 
      });
    }

    // Eliminar método de pago
    const deleted = await pool.query(
      'DELETE FROM metodos_pago WHERE id_metodos_pago = $1 RETURNING *',
      [id]
    );

    console.log(`Método de pago eliminado: ${deleted.rows[0].nombre}`);
    
    res.json({
      message: 'Método de pago eliminado exitosamente',
      metodoPago: deleted.rows[0]
    });
  } catch (error) {
    console.error('Error al eliminar método de pago:', error);
    res.status(500).json({ error: 'Error al eliminar método de pago' });
  }
};