const jwt = require('jsonwebtoken');
const pool = require('../db');

// Verificar token JWT (sin restricciones de rol)
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_temporal');
    
    // Verificar que el usuario aún existe (sin verificar si está activo para simplificar)
    const user = await pool.query(
      `SELECT u.*, tu.nombre as rol 
       FROM usuarios u 
       JOIN tipo_usuarios tu ON u.id_tipo_usuario = tu.id_tipo_usuario 
       WHERE u.id_usuario = $1`,
      [decoded.userId]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.user = user.rows[0];
    next();
  } catch (error) {
    console.error('Error en verificación de token:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = {
  verifyToken
};